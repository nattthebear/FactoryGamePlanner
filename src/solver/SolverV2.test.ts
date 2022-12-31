import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Recipes } from "../../data/generated/recipes";
import { Items } from "../../data/generated/items";
import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { ConstraintV2, ProblemV2, setupDictionary, solveV2 } from "./SolverV2";
import { stringify } from "./Dictionary";

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

describe("setupDictionary", () => {
	it("test 1", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				[
					Items.find((i) => i.ClassName === "Desc_OreIron_C")!,
					{ constraint: "available", rate: BigRat.fromInteger(10000) },
				],
				[
					Items.find((i) => i.ClassName === "Desc_IronIngot_C")!,
					{ constraint: "produced", rate: BigRat.fromInteger(500) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set([Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!]),
		};

		const { dictionary, isTwoPhase } = setupDictionary(problem);
		assert(!isTwoPhase);
		assert.equal(stringify(dictionary), "2,3;1;10000:1,-30:1,-500:1,30:1,0:1,-21:5");
	});

	it("test 2", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				...Object.entries(defaultMapResources).map(([k, v]): [Item, ConstraintV2] => [
					Items.find((i) => i.ClassName === k)!,
					{ constraint: "available", rate: BigRat.fromInteger(v) },
				]),
				[
					Items.find((i) => i.ClassName === "Desc_ModularFrame_C")!,
					{ constraint: "produced", rate: BigRat.fromInteger(10) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set([
				Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_IronRod_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Screw_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_IronPlate_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_IronPlateReinforced_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_ModularFrame_C")!,
			]),
		};

		const { dictionary, isTwoPhase } = setupDictionary(problem);
		assert(!isTwoPhase);
		assert.equal(
			stringify(dictionary),
			"7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23;1,2,3,4,5,6;70380:1,-30:1,0:1,0:1,0:1,0:1,0:1,28860:1,0:1,0:1,0:1,0:1,0:1,0:1,52860:1,0:1,0:1,0:1,0:1,0:1,0:1,30900:1,0:1,0:1,0:1,0:1,0:1,0:1,11040:1,0:1,0:1,0:1,0:1,0:1,0:1,11700:1,0:1,0:1,0:1,0:1,0:1,0:1,10500:1,0:1,0:1,0:1,0:1,0:1,0:1,6840:1,0:1,0:1,0:1,0:1,0:1,0:1,9780:1,0:1,0:1,0:1,0:1,0:1,0:1,2100:1,0:1,0:1,0:1,0:1,0:1,0:1,12000:1,0:1,0:1,0:1,0:1,0:1,0:1,-10:1,0:1,0:1,0:1,0:1,0:1,2:1,0:1,30:1,-15:1,0:1,-30:1,0:1,0:1,0:1,0:1,15:1,-10:1,0:1,0:1,-12:1,0:1,0:1,0:1,40:1,0:1,-60:1,0:1,0:1,0:1,0:1,0:1,20:1,-30:1,0:1,0:1,0:1,0:1,0:1,0:1,5:1,-3:1,0:1,-21:5,0:1,0:1,0:1,0:1,0:1"
		);
	});

	describe("power tests", () => {
		const makeProblem = (power: ConstraintV2 | null): ProblemV2 => ({
			constraints: new Map([
				[
					Items.find((i) => i.ClassName === "Desc_OreIron_C")!,
					{ constraint: "available", rate: BigRat.fromInteger(10000) },
				],
				[
					Items.find((i) => i.ClassName === "Desc_IronIngot_C")!,
					{ constraint: "produced", rate: BigRat.fromInteger(500) },
				],
			]),
			power,
			clockFactor: BigRat.ONE,
			availableRecipes: new Set([Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!]),
		});

		it("no power available", () => {
			const problem = makeProblem(null);
			const { dictionary, isTwoPhase } = setupDictionary(problem);
			assert(!isTwoPhase);

			assert.equal(stringify(dictionary), "2,3,4;1;10000:1,-30:1,-500:1,30:1,0:1,-4:1,0:1,-21:5");
		});

		it("limited power available", () => {
			const problem = makeProblem({ constraint: "available", rate: new BigRat(20n, 1n) });
			const { dictionary, isTwoPhase } = setupDictionary(problem);
			assert(!isTwoPhase);

			assert.equal(stringify(dictionary), "2,3,4;1;10000:1,-30:1,-500:1,30:1,20:1,-4:1,0:1,-108:25");
		});

		it("limited power available, intermediate item", () => {
			const problem: ProblemV2 = {
				constraints: new Map([
					[
						Items.find((i) => i.ClassName === "Desc_OreIron_C")!,
						{ constraint: "available", rate: BigRat.fromInteger(10000) },
					],
					[
						Items.find((i) => i.ClassName === "Desc_IronPlate_C")!,
						{ constraint: "produced", rate: BigRat.fromInteger(500) },
					],
				]),
				power: { constraint: "available", rate: BigRat.fromInteger(888) },
				clockFactor: BigRat.ONE,
				availableRecipes: new Set([
					Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!,
					Recipes.find((r) => r.ClassName === "Recipe_IronPlate_C")!,
				]),
			};
			const { dictionary, isTwoPhase } = setupDictionary(problem);
			assert(!isTwoPhase);

			assert.equal(
				stringify(dictionary),
				"3,4,5,6;1,2;10000:1,-30:1,0:1,-500:1,0:1,20:1,0:1,30:1,-30:1,888:1,-4:1,-4:1,0:1,-108:25,-3:25"
			);
		});

		it("limited power available, with overclocks", () => {
			const problem = makeProblem({ constraint: "available", rate: new BigRat(20n, 1n) });
			problem.clockFactor = BigRat.fromInteger(2);
			// A building at 2x uses 2.5x the power, so 1.25x the power cost per unit
			const { dictionary, isTwoPhase } = setupDictionary(problem);
			assert(!isTwoPhase);

			assert.equal(stringify(dictionary), "2,3,4;1;10000:1,-30:1,-500:1,30:1,20:1,-5:1,0:1,-87:20");
		});
	});
});
