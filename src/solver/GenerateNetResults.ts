import { Building, Item } from "../../data/types";
import { SIXTY } from "../editor/store/Common";
import { BigRat } from "../math/BigRat";
import { Problem, Solution } from "./Solver";

/** Negative consumed, positive produced */
export interface NetResults {
	items: Map<Item, BigRat>;
	power: BigRat;
}

/** Given that all buildings are clocked at an average of `clockFactor`, what's the real power consumption ratio? */
export function calculateOverclockedPowerRatio(building: Building, clockFactor: BigRat) {
	const exp = building.OverclockPowerFactor.toNumberApprox() - 1;
	const base = clockFactor.toNumberApprox();
	const factor = Math.pow(base, exp);
	return BigRat.parse(factor.toFixed(2));
}

export function generateNetResults(problem: Problem, solution: Solution): NetResults {
	let i = 0;
	const items = new Map<Item, BigRat>();
	let power = BigRat.ZERO;

	for (const recipe of problem.availableRecipes) {
		const buildingRate = solution.recipes[i++];
		if (buildingRate.sign() === 0) {
			continue;
		}

		for (const { Item, Rate } of recipe.Inputs) {
			const itemsPerMinute = Rate.mul(buildingRate);
			let existingRate = items.get(Item) ?? BigRat.ZERO;
			existingRate = existingRate.sub(itemsPerMinute);
			items.set(Item, existingRate);
		}
		for (const { Item, Rate } of recipe.Outputs) {
			const itemsPerMinute = Rate.mul(buildingRate);
			let existingRate = items.get(Item) ?? BigRat.ZERO;
			existingRate = existingRate.add(itemsPerMinute);
			items.set(Item, existingRate);
		}

		const buildingPower = calculateOverclockedPowerRatio(recipe.Building, problem.clockFactor)
			.mul(recipe.PowerConsumption ?? recipe.Building.PowerConsumption)
			.mul(buildingRate);
		power = power.sub(buildingPower);
	}

	return {
		items,
		power,
	};
}
