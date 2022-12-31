import { Building, Item } from "../../data/types";
import { SIXTY } from "../editor/store/Common";
import { BigRat } from "../math/BigRat";
import { ProblemV2, SolutionV2 } from "./SolverV2";

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

export function generateNetResults(problem: ProblemV2, solution: SolutionV2): NetResults {
	let i = 0;
	const items = new Map<Item, BigRat>();
	let power = BigRat.ZERO;

	for (const recipe of problem.availableRecipes) {
		const buildingRate = solution.recipes[i++];
		if (buildingRate.sign() === 0) {
			continue;
		}

		const rFactor = buildingRate.div(recipe.Duration);

		for (const { Item, Quantity } of recipe.Inputs) {
			const itemsPerSecond = rFactor.mul(Quantity);
			const itemsPerMinute = itemsPerSecond.mul(SIXTY);
			let existingRate = items.get(Item) ?? BigRat.ZERO;
			existingRate = existingRate.sub(itemsPerMinute);
			items.set(Item, existingRate);
		}
		for (const { Item, Quantity } of recipe.Outputs) {
			const itemsPerSecond = rFactor.mul(Quantity);
			const itemsPerMinute = itemsPerSecond.mul(SIXTY);
			let existingRate = items.get(Item) ?? BigRat.ZERO;
			existingRate = existingRate.add(itemsPerMinute);
			items.set(Item, existingRate);
		}

		const buildingPower = calculateOverclockedPowerRatio(recipe.Building, problem.clockFactor).mul(buildingRate);
		power = power.sub(buildingPower);
	}

	return {
		items,
		power,
	};
}
