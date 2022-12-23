import { Item, Recipe, RecipeFlow } from "../../data/types";
import { BigRat } from "../math/BigRat";
import solver from "javascript-lp-solver";
import { SIXTY } from "../editor/store/Common";
import { Items } from "../../data/generated/items";
import { Recipes } from "../../data/generated/recipes";
import { solve } from "./Solver";

export interface ResourceConstraint {
	/**
	 * `limited` - limited quantites are available and try to minimize their use.  Typically ores.  rate > 0.
	 * `available` - limited quantities are avilable but don't try to minimize their use.  Typically extra specified inputs.  rate > 0
	 * `produced` - What we're making.  rate > 0
	 * `plentiful` - Available in any quantity.  rate is meaningless.
	 */
	constraint: "limited" | "available" | "produced" | "plentiful";
	rate: BigRat;
}

export interface Problem {
	/** Any item not present here is assumed to be unavailable. */
	constraints: Map<Item, ResourceConstraint>;
	/** What recipes are allowed. */
	availableRecipes: Set<Recipe>;
}

export interface Solution {
	/** Usage amounts of each recipe, in the same order they're in availableRecipes */
	recipes: BigRat[];
	/** The final achieved WP value */
	wp: BigRat;
}

export function stringifyProblem(problem: Problem) {
	return (
		[...problem.constraints.entries()]
			.map(([k, v]) => `${k.ClassName},${v.constraint},${v.rate.toRatioString()}`)
			.join(";") +
		"@@" +
		[...problem.availableRecipes].map((r) => r.ClassName).join(";")
	);
}
const itemClassLookup = new Map(Items.map((i) => [i.ClassName, i]));
const recipeClassLookup = new Map(Recipes.map((r) => [r.ClassName, r]));
/** Doesn't do much error checking! */
export function unstringifyProblem(s: string): Problem {
	const [constraintData, recipeData] = s.split("@@").map((t) => t.split(";"));
	return {
		constraints: new Map(
			constraintData.map((t) => {
				const [clazz, constraint, rate] = t.split(",");
				return [
					itemClassLookup.get(clazz)!,
					{ constraint: constraint as ResourceConstraint["constraint"], rate: BigRat.fromRatioString(rate) },
				];
			})
		),
		availableRecipes: new Set(recipeData.map((clazz) => recipeClassLookup.get(clazz)!)),
	};
}

const defaultMapResources: Record<string, number> = {
	Desc_OreIron_C: 70380,
	Desc_OreCopper_C: 28860,
	Desc_Stone_C: 52860,
	Desc_Coal_C: 30900,
	Desc_OreGold_C: 11040,
	Desc_LiquidOil_C: 11700,
	Desc_RawQuartz_C: 10500,
	Desc_Sulfur_C: 6840,
	Desc_OreBauxite_C: 9780,
	Desc_OreUranium_C: 2100,
	Desc_NitrogenGas_C: 12000,
};

function doApproxSolve(problem: Problem) {
	let now = performance.now();
	const px: any = {
		optimize: "wp",
		opType: "min",
		constraints: {},
		variables: {},
	};
	const unlimitedItems = new Set<Item>();
	const wpFactors = new Map<Item, number>();
	function processItem(item: Item) {
		if (unlimitedItems.has(item)) {
			return; // already processed this
		}
		const clazz = item.ClassName;
		if (px.constraints[clazz]) {
			return; // already processed this
		}
		const constraint = problem.constraints.get(item);
		let pxc: any;
		switch (constraint?.constraint) {
			case undefined:
				pxc = { max: 0 };
				break;
			case "limited":
				wpFactors.set(item, 10000 / constraint.rate.toNumberApprox());
			case "available":
				pxc = { max: constraint.rate.toNumberApprox() };
				break;
			case "produced":
				pxc = { max: -constraint.rate.toNumberApprox() };
				break;
			case "plentiful":
				break;
		}
		if (pxc) {
			px.constraints[clazz] = pxc;
		}
	}

	for (const recipe of problem.availableRecipes) {
		for (const flow of recipe.Inputs) {
			processItem(flow.Item);
		}
		for (const flow of recipe.Outputs) {
			processItem(flow.Item);
		}
	}

	for (const recipe of problem.availableRecipes) {
		const clazz = recipe.ClassName;
		let wp = 0;
		const mats: any = {};
		function processFlow(flow: RecipeFlow, output: boolean) {
			if (unlimitedItems.has(flow.Item)) {
				return;
			}
			const itemsPerSecond = BigRat.ONE.div(recipe.Duration).mul(flow.Quantity);
			const itemsPerMinute = itemsPerSecond.mul(SIXTY);
			let itemsPerMinuteNumber = itemsPerMinute.toNumberApprox();
			if (output) {
				itemsPerMinuteNumber = -itemsPerMinuteNumber;
			}
			let wpFactor = wpFactors.get(flow.Item);
			if (wpFactor != null) {
				wp += itemsPerMinuteNumber * wpFactor;
			}
			mats[flow.Item.ClassName] = itemsPerMinuteNumber;
		}
		for (const flow of recipe.Inputs) {
			processFlow(flow, false);
		}
		for (const flow of recipe.Outputs) {
			processFlow(flow, true);
		}
		mats.wp = wp;
		px.variables[clazz] = mats;
	}
	console.log(`SETUP TIME ${performance.now() - now}ms`);
	// console.log(px);
	now = performance.now();
	const res = solver.Solve(px);
	console.log(`SOLVE TIME ${performance.now() - now}ms`);
	// console.log(res);
}

function doWipSolve(problem: Problem) {
	let now = performance.now();
	const res = solve(problem);
	if (res == null) {
		console.log("Infeasible??");
	} else {
		// const { recipes, wp } = res;
		// const recipeNames = [...problem.availableRecipes].map((r) => r.ClassName);
		// const recipeDescs = [...problem.availableRecipes].map((r) => r.DisplayName);
		// const data = recipes
		// 	.map((ratio, index) => [
		// 		`${recipeNames[index]} (${recipeDescs[index]})`,
		// 		`${ratio.toRatioString()} (${ratio.toNumberApprox().toFixed(3)})`,
		// 	])
		// 	.filter(([, s]) => s !== "0:1 (0.000)");
		// console.log("WP", wp.toRatioString());
		// console.log(data);
		console.log("Solved!");
	}
	console.log(`SOLVE TIME ${performance.now() - now}ms`);
}

export function doBothSolves(problem: Problem) {
	doApproxSolve(problem);
	doWipSolve(problem);
}

export function test() {
	doBothSolves({
		constraints: new Map([
			...Object.entries(defaultMapResources).map(([k, v]): [Item, ResourceConstraint] => [
				Items.find((i) => i.ClassName === k)!,
				{ constraint: "limited", rate: BigRat.fromInteger(v) },
			]),
			[
				Items.find((i) => i.ClassName === "Desc_ModularFrame_C")!,
				{ constraint: "produced", rate: BigRat.fromInteger(10) },
			],
		]),
		availableRecipes: new Set([
			Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_IronRod_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_Screw_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_IronPlate_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_IronPlateReinforced_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_ModularFrame_C")!,
		]),
	});
}
export function test2() {
	doBothSolves({
		constraints: new Map([
			...Object.entries(defaultMapResources).map(([k, v]): [Item, ResourceConstraint] => [
				Items.find((i) => i.ClassName === k)!,
				{ constraint: "limited", rate: BigRat.fromInteger(v) },
			]),
			[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "plentiful", rate: BigRat.ZERO }],
			[
				Items.find((i) => i.ClassName === "Desc_ModularFrame_C")!,
				{ constraint: "produced", rate: BigRat.fromInteger(10) },
			],
		]),
		availableRecipes: new Set(Recipes),
	});
}
export function test3() {
	doBothSolves({
		constraints: new Map([
			...Object.entries(defaultMapResources).map(([k, v]): [Item, ResourceConstraint] => [
				Items.find((i) => i.ClassName === k)!,
				{ constraint: "limited", rate: BigRat.fromInteger(v) },
			]),
			[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "plentiful", rate: BigRat.ZERO }],
			[
				Items.find((i) => i.ClassName === "Desc_SpaceElevatorPart_7_C")!,
				{ constraint: "produced", rate: new BigRat(3n, 2n) },
			],
		]),
		availableRecipes: new Set(Recipes),
	});
}
export function test4() {
	doBothSolves({
		constraints: new Map([
			[
				Items.find((i) => i.ClassName === "Desc_LiquidOil_C")!,
				{ constraint: "limited", rate: BigRat.fromInteger(11700) },
			],
			[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "plentiful", rate: BigRat.ZERO }],
			[
				Items.find((i) => i.ClassName === "Desc_Plastic_C")!,
				{ constraint: "produced", rate: new BigRat(600n, 1n) },
			],
		]),
		availableRecipes: new Set([
			Recipes.find((r) => r.ClassName === "Recipe_Alternate_HeavyOilResidue_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_ResidualRubber_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_Alternate_DilutedFuel_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_Alternate_RecycledRubber_C")!,
			Recipes.find((r) => r.ClassName === "Recipe_Alternate_Plastic_1_C")!,
		]),
	});
}
