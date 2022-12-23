import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Problem, ResourceConstraint, Solution, unstringifyProblem } from "./Solution";
import { Recipes } from "../../data/generated/recipes";
import { Items } from "../../data/generated/items";
import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { setupDictionary, solve } from "./Solver";
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
		const problem: Problem = {
			constraints: new Map([
				[
					Items.find((i) => i.ClassName === "Desc_OreIron_C")!,
					{ constraint: "limited", rate: BigRat.fromInteger(10000) },
				],
				[
					Items.find((i) => i.ClassName === "Desc_IronIngot_C")!,
					{ constraint: "produced", rate: BigRat.fromInteger(500) },
				],
			]),
			availableRecipes: new Set([Recipes.find((r) => r.ClassName === "Recipe_IngotIron_C")!]),
		};

		const dict = setupDictionary(problem);
		assert.equal(stringify(dict), "2,3;1;10000:1,-30:1,-500:1,30:1,0:1,-30:1");
	});

	it("test 2", () => {
		const problem: Problem = {
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
		};

		const dict = setupDictionary(problem);
		assert.equal(
			stringify(dict),
			"7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23;1,2,3,4,5,6;70380:1,-30:1,0:1,0:1,0:1,0:1,0:1,28860:1,0:1,0:1,0:1,0:1,0:1,0:1,52860:1,0:1,0:1,0:1,0:1,0:1,0:1,30900:1,0:1,0:1,0:1,0:1,0:1,0:1,11040:1,0:1,0:1,0:1,0:1,0:1,0:1,11700:1,0:1,0:1,0:1,0:1,0:1,0:1,10500:1,0:1,0:1,0:1,0:1,0:1,0:1,6840:1,0:1,0:1,0:1,0:1,0:1,0:1,9780:1,0:1,0:1,0:1,0:1,0:1,0:1,2100:1,0:1,0:1,0:1,0:1,0:1,0:1,12000:1,0:1,0:1,0:1,0:1,0:1,0:1,-10:1,0:1,0:1,0:1,0:1,0:1,2:1,0:1,30:1,-15:1,0:1,-30:1,0:1,0:1,0:1,0:1,15:1,-10:1,0:1,0:1,-12:1,0:1,0:1,0:1,40:1,0:1,-60:1,0:1,0:1,0:1,0:1,0:1,20:1,-30:1,0:1,0:1,0:1,0:1,0:1,0:1,5:1,-3:1,0:1,-5000:1173,0:1,0:1,0:1,0:1,0:1"
		);
	});
});

function debugPrint(p: Problem, s: Solution) {
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

describe("solve", () => {
	it("mod frames", () => {
		const problem: Problem = {
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
		};
		const solution = solve(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 40000:1173 Iron Ingot: 8:1 Iron Rod: 7:1 Screw: 9:2 Iron Plate: 9:2 Reinforced Iron Plate: 3:1 Modular Frame: 5:1"
		);
	});

	it("hi tech mod frames", () => {
		const problem: Problem = {
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
		};
		const solution = solve(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 3101875:274482 Alternate: Adhered Iron Plate: 4:1 Petroleum Coke: 9:64 Residual Rubber: 25:144 Modular Frame: 5:1 Alternate: Coke Steel Ingot: 9:40 Alternate: Heavy Oil Residue: 25:72 Alternate: Recycled Rubber: 101:324 Alternate: Steel Coated Plate: 1:1 Alternate: Steel Rod: 5:4 Alternate: Diluted Fuel: 119:720 Alternate: Recycled Plastic: 155:648"
		);
	});

	it("ADS", () => {
		const problem: Problem = {
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
		};
		const solution = solve(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 645354705393544675:1896578880308112 Cable: 15:1 Alternate: Adhered Iron Plate: 16:5 Petroleum Coke: 2419:1280 Residual Rubber: 140281:73920 Modular Frame: 4:1 Alternate: Coke Steel Ingot: 2307:800 Alternate: Electrode - Aluminum Scrap: 7:40 Alclad Aluminum Sheet: 7:8 Alumina Solution: 21:80 Adaptive Control Unit: 3:1 Alternate: Heavy Oil Residue: 140281:36960 Stator: 99:20 Automated Wiring: 9:1 AI Limiter: 3:10 Alternate: Pure Aluminum Ingot: 7:8 Alternate: Pure Caterium Ingot: 38317:14784 Alternate: Pure Copper Ingot: 3037:616 Alternate: Pure Iron Ingot: 523:52 Alternate: Recycled Rubber: 54251:23760 Alternate: Rubber Concrete: 8:5 Alternate: Steamed Copper Sheet: 11:12 Alternate: Steel Coated Plate: 4:5 Alternate: Steel Rod: 1:1 Steel Pipe: 721:80 Alternate: Classic Battery: 1:2 Assembly Director System: 2:1 Alternate: Diluted Fuel: 563459:369600 Alternate: Super-State Computer: 5:8 Electromagnetic Control Rod: 3:8 Alternate: Silicon Circuit Board: 21:44 Alternate: Caterium Circuit Board: 4029:770 Alternate: Caterium Computer: 7:5 Alternate: Heavy Encased Frame: 16:15 Alternate: Recycled Plastic: 930863:332640 Alternate: Fused Quickwire: 38317:9240 Alternate: Encased Industrial Pipe: 5:2 Alternate: Iron Wire: 523:10"
		);
	});

	it("making plastic and stuff", () => {
		const problem: Problem = {
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
		};
		const solution = solve(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 20000:117 Alternate: Heavy Oil Residue: 20:3 Residual Rubber: 10:3 Alternate: Diluted Fuel: 16:3 Alternate: Recycled Rubber: 140:27 Alternate: Recycled Plastic: 340:27"
		);
	});

	it("aluminium", () => {
		const problem: Problem = {
			constraints: new Map([
				...Object.entries(defaultMapResources).map(([k, v]): [Item, ResourceConstraint] => [
					Items.find((i) => i.ClassName === k)!,
					{ constraint: "limited", rate: BigRat.fromInteger(v) },
				]),
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "plentiful", rate: BigRat.ZERO }],
				[
					Items.find((i) => i.ClassName === "Desc_AluminumIngot_C")!,
					{ constraint: "produced", rate: new BigRat(1000n, 1n) },
				],
			]),
			availableRecipes: new Set([
				Recipes.find((r) => r.DisplayName === "Silica")!,
				Recipes.find((r) => r.DisplayName === "Aluminum Scrap")!,
				Recipes.find((r) => r.DisplayName === "Alumina Solution")!,
				Recipes.find((r) => r.DisplayName === "Aluminum Ingot")!,
			]),
		};
		const solution = solve(problem);
		assert(solution);
		assert.equal(
			debugPrint(problem, solution),
			"wp: 585440000:352569 Silica: 200:9 Aluminum Scrap: 25:6 Alumina Solution: 25:3 Aluminum Ingot: 50:3"
		);
	});
});
