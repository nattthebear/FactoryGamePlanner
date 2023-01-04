import { Items } from "../../data/generated/items";
import { Recipes } from "../../data/generated/recipes";
import { Item, Recipe } from "../../data/types";
import { SIXTY } from "../editor/store/Common";
import { produce } from "../immer";
import { BigRat } from "../math/BigRat";
import { Dictionary, solveStandardFormMutate, solveStandardFormMutateCoop } from "./Dictionary";
import { calculateOverclockedPowerRatio, generateNetResults } from "./GenerateNetResults";

const WP_RATES = new Map<Item, BigRat>(
	[
		{ className: "Desc_OreIron_C", wp: "0.14" },
		{ className: "Desc_OreCopper_C", wp: "0.35" },
		{ className: "Desc_Stone_C", wp: "0.19" },
		{ className: "Desc_Coal_C", wp: "0.32" },
		{ className: "Desc_OreGold_C", wp: "0.91" },
		{ className: "Desc_LiquidOil_C", wp: "0.85" },
		{ className: "Desc_RawQuartz_C", wp: "0.95" },
		{ className: "Desc_Sulfur_C", wp: "1.46" },
		{ className: "Desc_OreBauxite_C", wp: "1.02" },
		{ className: "Desc_OreUranium_C", wp: "4.76" },
		{ className: "Desc_NitrogenGas_C", wp: "0.83" },
	].map(({ className, wp }) => [Items.find((i) => i.ClassName === className)!, BigRat.parse(wp).neg()])
);

/*
Using the above WP rates, the actual value of 1 MW of power is:
from coal: 0.064
from oil (basic fuel recipe): 0.109
from oil (purple stuff to diluted sunny D): 0.028
turbofuel: (best alternates): 0.048
perfect combination of plutonium and uranium, all best alternate recipes: 0.024
*/
const POWER_WP = BigRat.parse("-0.03");

/** This resource is available as an input */
export interface AvailableConstraint {
	constraint: "available";
	/** If null, unlimited.  Otherwise, a positive amount that is available. */
	rate: BigRat | null;
}

/** This resource should be produced as an output */
export interface ProducedConstraint {
	constraint: "produced";
	/** If null, produce as much as possible.  Otherwise, a positive amount that should be produced */
	rate: BigRat | null;
}

export type Constraint = AvailableConstraint | ProducedConstraint;

export interface Problem {
	constraints: Map<Item, Constraint>;
	/** Similar to the item constraints, but for power and in MW */
	power: Constraint | null;
	/** Average overclock rate (0.01x - 2.5x) of all buildings */
	clockFactor: BigRat;
	/** What recipes are allowed. */
	availableRecipes: Set<Recipe>;
}

export interface Solution {
	/** Usage of each recipe, in the order they're specified in availableRecipes */
	recipes: BigRat[];
	/** Net WP of the solution */
	wp: BigRat;
}

export function stringifyProblem(problem: Problem) {
	return [
		[...problem.constraints.entries()]
			.map(([k, v]) => `${k.ClassName},${v.constraint},${v.rate?.toRatioString() ?? "null"}`)
			.join(";"),
		problem.power ? `${problem.power.constraint},${problem.power.rate?.toRatioString() ?? "null"}` : "null",
		problem.clockFactor.toRatioString(),
		[...problem.availableRecipes].map((r) => r.ClassName).join(";"),
	].join("@@");
}
const itemClassLookup = new Map(Items.map((i) => [i.ClassName, i]));
const recipeClassLookup = new Map(Recipes.map((r) => [r.ClassName, r]));
/** Doesn't do much error checking! */
export function unstringifyProblem(s: string): Problem {
	const [constraintData, powerData, clockFactorData, availableRecipeData] = s.split("@@");

	return {
		constraints: new Map(
			constraintData.split(";").map((t) => {
				const [clazz, constraint, rate] = t.split(",");
				return [
					itemClassLookup.get(clazz)!,
					{
						constraint: constraint as "produced" | "available",
						rate: rate === "null" ? null : BigRat.fromRatioString(rate),
					},
				];
			})
		),
		power: (() => {
			if (powerData === "null") {
				return null;
			}
			const [constraint, rate] = powerData.split(",");
			return {
				constraint: constraint as "produced" | "available",
				rate: rate === "null" ? null : BigRat.fromRatioString(rate),
			};
		})(),
		clockFactor: BigRat.fromRatioString(clockFactorData),
		availableRecipes: new Set(availableRecipeData.split(";").map((clazz) => recipeClassLookup.get(clazz)!)),
	};
}

/*
How to compute objective functions:
If there's at least one "produced" null, run a pre-problem with the objective function
being simply a 1x for every "produced" null.  The results there then become production constraints
for the problem.

Either way, for the problem proper the objective is standard WP on natural resources and power,
filtered to only to those resources that appear as >0 input constraints.
*/

/** Fills an array with n integers starting at first */
function makeRangeArray(n: number, first: number) {
	const ret = Array<number>(n);
	for (let i = 0; i < n; i++, first++) {
		ret[i] = first;
	}
	return ret;
}

export function setupDictionary({ constraints, power, clockFactor, availableRecipes }: Problem) {
	const itemsToConstraintRows = new Map<Item, number>();
	const normalObjectives = new Set<Item>();
	const maxiObjectives = new Set<Item>();
	const plentiful = new Set<Item>();
	let powerRow = -1;
	let nRows: number;
	const pitch = availableRecipes.size + 1;
	let isDualObjective = false;
	let constraintCount: number;
	let objectiveStart: number;

	let primPowerCoeff: BigRat | undefined;
	let secPowerCoeff: BigRat | undefined;

	{
		let a = 0;
		for (const [item, { constraint, rate }] of constraints.entries()) {
			if (rate != null) {
				itemsToConstraintRows.set(item, a++);
			} else {
				plentiful.add(item);
				if (constraint === "produced") {
					maxiObjectives.add(item);
					isDualObjective = true;
				} else {
					normalObjectives.add(item);
				}
			}
		}
		for (const { Inputs, Outputs } of availableRecipes) {
			for (const { Item } of Inputs) {
				if (!itemsToConstraintRows.has(Item) && !plentiful.has(Item)) {
					itemsToConstraintRows.set(Item, a++);
				}
			}
			for (const { Item } of Outputs) {
				if (!itemsToConstraintRows.has(Item) && !plentiful.has(Item)) {
					itemsToConstraintRows.set(Item, a++);
				}
			}
		}

		if (power == null || power.rate != null) {
			powerRow = a++;
		} else if (power.constraint === "produced" && power.rate == null) {
			isDualObjective = true;
		}

		constraintCount = a;
		nRows = constraintCount + (isDualObjective ? 2 : 1);
		objectiveStart = a * pitch;
	}

	const coefficients = Array<BigRat>(nRows * pitch).fill(BigRat.ZERO);

	{
		let a = pitch - 1;
		for (const { constraint, rate } of constraints.values()) {
			if (rate != null) {
				let adjustedRate = rate;
				if (constraint === "produced") {
					adjustedRate = adjustedRate.neg();
				}
				coefficients[a] = adjustedRate;
				a += pitch;
			}
		}
	}

	if (power?.rate != null) {
		let { constraint, rate } = power;
		if (constraint === "produced") {
			rate = rate.neg();
		}
		coefficients[powerRow * pitch + pitch - 1] = rate;
	}

	const primaryObjectiveCoefficients = new Map<Item, BigRat>();
	const secondaryObjectiveCoefficients = new Map<Item, BigRat>();
	if (isDualObjective) {
		for (const [item, { constraint, rate }] of constraints.entries()) {
			if (constraint === "produced" && rate == null) {
				primaryObjectiveCoefficients.set(item, BigRat.MINUS_ONE);
			}
		}
		if (power?.constraint === "produced" && power.rate == null) {
			primPowerCoeff = BigRat.MINUS_ONE;
		}
	}

	{
		const destMap = isDualObjective ? secondaryObjectiveCoefficients : primaryObjectiveCoefficients;
		for (const [item, { constraint, rate }] of constraints.entries()) {
			if (constraint === "available" && rate != null) {
				const wp = WP_RATES.get(item);
				if (wp) {
					destMap.set(item, wp);
				}
			}
		}
		if (power?.constraint === "available" && power.rate != null) {
			if (isDualObjective) {
				secPowerCoeff = POWER_WP;
			} else {
				primPowerCoeff = POWER_WP;
			}
		}
	}

	{
		let i = 0;
		for (const recipe of availableRecipes) {
			let zPrim = BigRat.ZERO;
			let zSec = BigRat.ZERO;
			for (const { Item, Quantity } of recipe.Inputs) {
				const itemsPerMinute = Quantity.div(recipe.Duration).mul(SIXTY);
				const row = itemsToConstraintRows.get(Item);
				if (row != null) {
					const pos = row * pitch + i;
					coefficients[pos] = coefficients[pos].sub(itemsPerMinute);
				}
				const zPrimFac = primaryObjectiveCoefficients.get(Item);
				if (zPrimFac != null) {
					zPrim = zPrim.add(zPrimFac.mul(itemsPerMinute));
				}
				const zSecFac = secondaryObjectiveCoefficients.get(Item);
				if (zSecFac != null) {
					zSec = zSec.add(zSecFac.mul(itemsPerMinute));
				}
			}
			for (const { Item, Quantity } of recipe.Outputs) {
				const itemsPerMinute = Quantity.div(recipe.Duration).mul(SIXTY);
				const row = itemsToConstraintRows.get(Item);
				if (row != null) {
					const pos = row * pitch + i;
					coefficients[pos] = coefficients[pos].add(itemsPerMinute);
				}
				const zPrimFac = primaryObjectiveCoefficients.get(Item);
				if (zPrimFac != null) {
					zPrim = zPrim.sub(zPrimFac.mul(itemsPerMinute));
				}
				const zSecFac = secondaryObjectiveCoefficients.get(Item);
				if (zSecFac != null) {
					zSec = zSec.sub(zSecFac.mul(itemsPerMinute));
				}
			}
			{
				// TODO: overclockFactor
				const recipePower = recipe.PowerConsumption ?? recipe.Building.PowerConsumption;
				const ocMod = calculateOverclockedPowerRatio(recipe.Building, clockFactor);
				const recipePowerMod = recipePower.mul(ocMod);

				const row = powerRow;
				if (row >= 0) {
					const pos = row * pitch + i;
					coefficients[pos] = recipePowerMod.neg();
				}
				if (primPowerCoeff != null) {
					zPrim = zPrim.add(primPowerCoeff.mul(recipePowerMod));
				}
				if (secPowerCoeff != null) {
					zSec = zSec.add(secPowerCoeff.mul(recipePowerMod));
				}
			}
			coefficients[objectiveStart + i] = zPrim;
			if (isDualObjective) {
				coefficients[objectiveStart + pitch + i] = zSec;
			}
			i++;
		}
	}

	const nonBasic = makeRangeArray(availableRecipes.size, 1);
	const basic = makeRangeArray(constraintCount, pitch);

	return new Dictionary(basic, nonBasic, isDualObjective, coefficients);
}

function buildSolution(problem: Problem, dictionary: Dictionary): Solution {
	const numRecipes = problem.availableRecipes.size;
	const pitch = numRecipes + 1;

	const recipeUsages = Array<BigRat>(numRecipes).fill(BigRat.ZERO);
	let wp: BigRat;

	{
		let aRow = pitch - 1;
		for (const name of dictionary.basic) {
			if (name < pitch) {
				const coeff = dictionary.coefficients[aRow];
				recipeUsages[name - 1] = coeff;
			}
			aRow += pitch;
		}
		wp = dictionary.coefficients[aRow + (dictionary.isDualObjective ? pitch : 0)].neg();
	}

	return { recipes: recipeUsages, wp };
}

export function solve(problem: Problem): Solution | null {
	if (problem.availableRecipes.size === 0) {
		return null;
	}
	const dictionary = setupDictionary(problem);
	const outputDict = solveStandardFormMutate(dictionary);
	if (!outputDict) {
		return null;
	}
	return buildSolution(problem, outputDict);
}

export function* solveCoop(problem: Problem) {
	if (problem.availableRecipes.size === 0) {
		return null;
	}
	const dictionary = setupDictionary(problem);
	yield;
	const outputDict = yield* solveStandardFormMutateCoop(dictionary);
	if (!outputDict) {
		return null;
	}
	return buildSolution(problem, outputDict);
}
