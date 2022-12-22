import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { Item } from "../../../data/types";
import { getEncodedDataForTab, TAB_PLANNER } from "../../base64";
import { makeStore } from "../../MakeStore";
import { BigRat } from "../../math/BigRat";
import { Problem } from "../../solver/Solution";
import { Flow } from "../../util";
import { deserialize } from "./Serializer";

export const BasicRecipes = Recipes.filter((r) => !r.Alternate);
export const AlternateRecipes = Recipes.filter((r) => r.Alternate);
export const Resources = Items.filter((r) => r.IsResource);

export const defaultResourceData = new Map<Item, BigRat>(
	[
		{ className: "Desc_OreIron_C", rate: 70380 },
		{ className: "Desc_OreCopper_C", rate: 28860 },
		{ className: "Desc_Stone_C", rate: 52860 },
		{ className: "Desc_Coal_C", rate: 30900 },
		{ className: "Desc_OreGold_C", rate: 11040 },
		{ className: "Desc_LiquidOil_C", rate: 11700 },
		{ className: "Desc_RawQuartz_C", rate: 10500 },
		{ className: "Desc_Sulfur_C", rate: 6840 },
		{ className: "Desc_OreBauxite_C", rate: 9780 },
		{ className: "Desc_OreUranium_C", rate: 2100 },
		{ className: "Desc_NitrogenGas_C", rate: 12000 },
	].map(({ className, rate }) => [Items.find((i) => i.ClassName === className)!, BigRat.fromInteger(rate)])
);

const resourceDefaults = Resources.map((r) => defaultResourceData.get(r) ?? null);

export interface State {
	/** Is each basic recipe available? */
	basicRecipes: boolean[];
	/** Is each alternate recipe available? */
	alternateRecipes: boolean[];
	/** Every requested output. */
	products: Flow[];
	/** Available amounts of each of the natural resources.  Can be zero.  `null` means no limit. */
	resources: (BigRat | null)[];
	/** Any additional inputs available besides the natural resources. */
	inputs: Flow[];
}

export const makeEmptyState = (): State => ({
	basicRecipes: BasicRecipes.map(() => true),
	alternateRecipes: AlternateRecipes.map(() => false),
	products: [],
	resources: resourceDefaults,
	inputs: [],
});

const initialState = (() => {
	const search = getEncodedDataForTab(TAB_PLANNER);
	if (search) {
		try {
			const reconstructed = deserialize(search);
			if (reconstructed) {
				return reconstructed;
			}
		} catch (e) {
			console.error(e);
		}
	}
	return makeEmptyState();
})();

export const { useSelector, update, getStateRaw } = makeStore(initialState, "_PlannerStore");

export function makeProblem(state: State): Problem {
	const res: Problem = {
		constraints: new Map(),
		availableRecipes: new Set(),
	};

	for (let i = 0; i < BasicRecipes.length; i++) {
		if (state.basicRecipes[i]) {
			res.availableRecipes.add(BasicRecipes[i]);
		}
	}
	for (let i = 0; i < AlternateRecipes.length; i++) {
		if (state.alternateRecipes[i]) {
			res.availableRecipes.add(AlternateRecipes[i]);
		}
	}

	for (let i = 0; i < Resources.length; i++) {
		const rate = state.resources[i];
		const item = Resources[i];
		if (!rate) {
			res.constraints.set(item, { constraint: "plentiful", rate: BigRat.ZERO });
		} else if (rate.sign() > 0) {
			res.constraints.set(item, { constraint: "limited", rate });
		}
	}
	for (const { rate, item } of state.inputs) {
		res.constraints.set(item, { constraint: "available", rate });
	}
	for (const { rate, item } of state.products) {
		res.constraints.set(item, { constraint: "produced", rate });
	}

	return res;
}
