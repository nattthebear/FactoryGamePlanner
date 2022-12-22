import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { SIXTY } from "../editor/store/Common";
import { Dictionary, solveStandardForm, stringify } from "./Dictionary";
import { Problem, Solution } from "./Solution";

const TEN_THOUSAND = new BigRat(-10000n, 1n);

/** Fills an array with n integers starting at first */
function makeRangeArray(n: number, first: number) {
	const ret = Array<number>(n);
	for (let i = 0; i < n; i++, first++) {
		ret[i] = first;
	}
	return ret;
}

export function setupDictionary(problem: Problem): Dictionary {
	const { constraints, availableRecipes } = problem;

	const itemsToConstraintRows = new Map<Item, number>();
	const wpFactors = new Map<Item, BigRat>();
	const plentiful = new Set<Item>();

	{
		let a = 0;
		for (const [item, { constraint, rate }] of constraints.entries()) {
			if (constraint !== "plentiful") {
				itemsToConstraintRows.set(item, a++);
			} else {
				plentiful.add(item);
			}
			if (constraint === "limited") {
				wpFactors.set(item, TEN_THOUSAND.div(rate));
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
	}

	const nRows = itemsToConstraintRows.size + 1;
	const pitch = availableRecipes.size + 1;
	const objectiveStart = itemsToConstraintRows.size * pitch;

	const coefficients = Array<BigRat>(nRows * pitch).fill(BigRat.ZERO);

	{
		let a = 0;
		for (const { constraint, rate } of constraints.values()) {
			if (constraint !== "plentiful") {
				let adjustedRate = rate;
				if (constraint === "produced") {
					adjustedRate = adjustedRate.neg();
				}
				coefficients[a] = adjustedRate;
				a += pitch;
			}
		}
	}

	{
		let i = 1;
		for (const recipe of availableRecipes) {
			let wp = BigRat.ZERO;
			for (const { Item, Quantity } of recipe.Inputs) {
				const row = itemsToConstraintRows.get(Item);
				if (row != null) {
					const itemsPerMinute = Quantity.div(recipe.Duration).mul(SIXTY);
					const pos = row * pitch + i;
					coefficients[pos] = coefficients[pos].sub(itemsPerMinute);
					const wpFactor = wpFactors.get(Item);
					if (wpFactor != null) {
						wp = wp.add(wpFactor.mul(itemsPerMinute));
					}
				}
			}
			for (const { Item, Quantity } of recipe.Outputs) {
				const row = itemsToConstraintRows.get(Item);
				if (row != null) {
					const itemsPerMinute = Quantity.div(recipe.Duration).mul(SIXTY);
					const pos = row * pitch + i;
					coefficients[pos] = coefficients[pos].add(itemsPerMinute);
					const wpFactor = wpFactors.get(Item);
					if (wpFactor != null) {
						// TODO: This might not make sense
						wp = wp.sub(wpFactor.mul(itemsPerMinute));
					}
				}
			}
			coefficients[objectiveStart + i] = wp;
			i++;
		}
	}

	const nonBasic = makeRangeArray(availableRecipes.size, 1);
	const basic = makeRangeArray(itemsToConstraintRows.size, pitch);

	return {
		basic,
		nonBasic,
		coefficients,
	};
}

export function solve(problem: Problem): Solution | null {
	const inputDict = setupDictionary(problem);
	const outputDict = solveStandardForm(inputDict);
	if (!outputDict) {
		return null;
	}

	const numRecipes = problem.availableRecipes.size;
	const pitch = numRecipes + 1;

	const recipeUsages = Array<BigRat>(numRecipes).fill(BigRat.ZERO);
	let wp: BigRat;

	{
		let aRow = 0;
		for (const name of outputDict.basic) {
			if (name < pitch) {
				const coeff = outputDict.coefficients[aRow];
				recipeUsages[name - 1] = coeff;
			}
			aRow += pitch;
		}
		wp = outputDict.coefficients[aRow].neg();
	}

	return { recipes: recipeUsages, wp };
}
