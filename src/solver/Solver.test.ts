import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Recipes } from "../../data/generated/recipes";
import { Items } from "../../data/generated/items";
import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { ConstraintV2, ProblemV2, setupDictionary, SolutionV2, solveV2, unstringifyProblem } from "./Solver";
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

		it("make maximized power", () => {
			const problem = makeProblem({ constraint: "produced", rate: null });
			const { dictionary, isTwoPhase } = setupDictionary(problem);
			assert(isTwoPhase);

			assert.equal(stringify(dictionary), "2,3;1;10000:1,-30:1,-500:1,30:1,0:1,-4:1");
		});
	});
});

function debugPrint(p: ProblemV2, s: SolutionV2) {
	let str = `wp: ${s.wp.toRatioString()}`;
	let i = 0;
	for (const recipe of p.availableRecipes) {
		const rate = s.recipes[i++];
		if (rate.sign() === 0) {
			continue;
		}
		str += ` ${recipe.DisplayName}: ${rate.toRatioString()}`;
	}
	return str;
}

describe("solveV2", () => {
	it("mod frames", () => {
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
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 168:5 Iron Ingot: 8:1 Iron Rod: 7:1 Screw: 9:2 Iron Plate: 9:2 Reinforced Iron Plate: 3:1 Modular Frame: 5:1"
		);
	});

	it("hi tech mod frames", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				...Object.entries(defaultMapResources).map(([k, v]): [Item, ConstraintV2] => [
					Items.find((i) => i.ClassName === k)!,
					{ constraint: "available", rate: BigRat.fromInteger(v) },
				]),
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "available", rate: null }],
				[
					Items.find((i) => i.ClassName === "Desc_ModularFrame_C")!,
					{ constraint: "produced", rate: BigRat.fromInteger(10) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set(Recipes),
		};
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 673:60 Alternate: Adhered Iron Plate: 4:1 Petroleum Coke: 9:64 Residual Rubber: 25:144 Modular Frame: 5:1 Alternate: Coke Steel Ingot: 9:40 Alternate: Heavy Oil Residue: 25:72 Alternate: Recycled Rubber: 101:324 Alternate: Steel Coated Plate: 1:1 Alternate: Steel Rod: 5:4 Alternate: Diluted Fuel: 119:720 Alternate: Recycled Plastic: 155:648"
		);
	});

	it("ADS", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				...Object.entries(defaultMapResources).map(([k, v]): [Item, ConstraintV2] => [
					Items.find((i) => i.ClassName === k)!,
					{ constraint: "available", rate: BigRat.fromInteger(v) },
				]),
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "available", rate: null }],
				[
					Items.find((i) => i.ClassName === "Desc_SpaceElevatorPart_7_C")!,
					{ constraint: "produced", rate: new BigRat(3n, 2n) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set(Recipes),
		};
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 67870809:200200 Cable: 15:1 Alternate: Adhered Iron Plate: 16:5 Petroleum Coke: 2419:1280 Residual Rubber: 140281:73920 Modular Frame: 4:1 Alternate: Coke Steel Ingot: 2307:800 Alternate: Electrode - Aluminum Scrap: 7:40 Alclad Aluminum Sheet: 7:8 Alumina Solution: 21:80 Adaptive Control Unit: 3:1 Alternate: Heavy Oil Residue: 140281:36960 Stator: 99:20 Automated Wiring: 9:1 AI Limiter: 3:10 Alternate: Pure Aluminum Ingot: 7:8 Alternate: Pure Caterium Ingot: 38317:14784 Alternate: Pure Copper Ingot: 3037:616 Alternate: Pure Iron Ingot: 523:52 Alternate: Recycled Rubber: 54251:23760 Alternate: Rubber Concrete: 8:5 Alternate: Steamed Copper Sheet: 11:12 Alternate: Steel Coated Plate: 4:5 Alternate: Steel Rod: 1:1 Steel Pipe: 721:80 Alternate: Classic Battery: 1:2 Assembly Director System: 2:1 Alternate: Diluted Fuel: 563459:369600 Alternate: Super-State Computer: 5:8 Electromagnetic Control Rod: 3:8 Alternate: Silicon Circuit Board: 21:44 Alternate: Caterium Circuit Board: 4029:770 Alternate: Caterium Computer: 7:5 Alternate: Heavy Encased Frame: 16:15 Alternate: Recycled Plastic: 930863:332640 Alternate: Fused Quickwire: 38317:9240 Alternate: Encased Industrial Pipe: 5:2 Alternate: Iron Wire: 523:10"
		);
	});

	it("making plastic and stuff", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				[
					Items.find((i) => i.ClassName === "Desc_LiquidOil_C")!,
					{ constraint: "available", rate: BigRat.fromInteger(11700) },
				],
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "available", rate: null }],
				[
					Items.find((i) => i.ClassName === "Desc_Plastic_C")!,
					{ constraint: "produced", rate: new BigRat(600n, 1n) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set([
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_HeavyOilResidue_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_ResidualRubber_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_DilutedFuel_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_RecycledRubber_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_Plastic_1_C")!,
			]),
		};
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 170:1 Alternate: Heavy Oil Residue: 20:3 Residual Rubber: 10:3 Alternate: Diluted Fuel: 16:3 Alternate: Recycled Rubber: 140:27 Alternate: Recycled Plastic: 340:27"
		);
	});

	it("aluminium", () => {
		const problem: ProblemV2 = {
			constraints: new Map([
				...Object.entries(defaultMapResources).map(([k, v]): [Item, ConstraintV2] => [
					Items.find((i) => i.ClassName === k)!,
					{ constraint: "available", rate: BigRat.fromInteger(v) },
				]),
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "available", rate: null }],
				[
					Items.find((i) => i.ClassName === "Desc_AluminumIngot_C")!,
					{ constraint: "produced", rate: new BigRat(1000n, 1n) },
				],
			]),
			power: { constraint: "available", rate: null },
			clockFactor: BigRat.ONE,
			availableRecipes: new Set([
				Recipes.find((r) => r.DisplayName === "Silica")!,
				Recipes.find((r) => r.DisplayName === "Aluminum Scrap")!,
				Recipes.find((r) => r.DisplayName === "Alumina Solution")!,
				Recipes.find((r) => r.DisplayName === "Aluminum Ingot")!,
			]),
		};
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 1655:1 Silica: 200:9 Aluminum Scrap: 25:6 Alumina Solution: 25:3 Aluminum Ingot: 50:3"
		);
	});

	it("simple maximize problem", () => {
		const problem = unstringifyProblem(
			"Desc_OreIron_C,available,43:1;Desc_OreCopper_C,available,79:1;Desc_IronIngot_C,produced,null;Desc_CopperIngot_C,produced,null@@available,null@@1:1@@Recipe_IngotCopper_C;Recipe_IngotIron_C"
		);
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(debugPrint(problem, solution), "wp: 3367:100 Copper Ingot: 79:30 Iron Ingot: 43:30");
	});

	it("basic coal power", () => {
		const problem = unstringifyProblem(
			"Desc_Coal_C,available,600:1;Desc_Water_C,available,null@@produced,60:1@@1:1@@$GENERATED_POWER$Build_GeneratorCoal_C$Desc_Coal_C;$GENERATED_POWER$Build_GeneratorCoal_C$Desc_CompactedCoal_C;$GENERATED_POWER$Build_GeneratorCoal_C$Desc_PetroleumCoke_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidFuel_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidTurboFuel_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidBiofuel_C;$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_NuclearFuelRod_C;$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_PlutoniumFuelRod_C"
		);
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(debugPrint(problem, solution), "wp: 96:25 Power from Coal: 4:5");
	});

	it("mix coal and oil power", () => {
		const problem = unstringifyProblem(
			"Desc_Coal_C,available,10:1;Desc_Water_C,available,null;Desc_LiquidOil_C,available,600:1@@produced,60:1@@1:1@@Recipe_LiquidFuel_C;Recipe_ResidualFuel_C;$GENERATED_POWER$Build_GeneratorCoal_C$Desc_Coal_C;$GENERATED_POWER$Build_GeneratorCoal_C$Desc_CompactedCoal_C;$GENERATED_POWER$Build_GeneratorCoal_C$Desc_PetroleumCoke_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidFuel_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidTurboFuel_C;$GENERATED_POWER$Build_GeneratorFuel_C$Desc_LiquidBiofuel_C;$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_NuclearFuelRod_C;$GENERATED_POWER$Build_GeneratorNuclear_C$Desc_PlutoniumFuelRod_C;Recipe_Alternate_HeavyOilResidue_C"
		);
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 41:10 Residual Fuel: 2:85 Power from Coal: 2:3 Power from Fuel: 4:51 Alternate: Heavy Oil Residue: 3:85"
		);
	});

	it("power maximization", () => {
		const problem = unstringifyProblem(
			"Desc_Coal_C,available,10:1;Desc_Water_C,available,null@@produced,null@@1:1@@$GENERATED_POWER$Build_GeneratorCoal_C$Desc_Coal_C"
		);
		const solution = solveV2(problem);
		assert(solution);
		assert.equal(debugPrint(problem, solution), "wp: 16:5 Power from Coal: 2:3");
	});
});
