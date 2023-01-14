import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { FakePower } from "../../../data/power";
import { Item } from "../../../data/types";
import { makeStore, makeStoreWithHashRouter, ROUTER_PLANNER_STORE } from "../../MakeStore";
import { BigRat } from "../../math/BigRat";
import { Problem } from "../../solver/Solver";
import { Flow } from "../../util";
import { deserialize, serialize } from "./Serializer";

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
const Water = Items.find((i) => i.ClassName === "Desc_Water_C")!;

const resourceDefaults = Resources.map((r) => defaultResourceData.get(r) ?? null);

export interface NullableFlow {
	rate: BigRat | null;
	item: Item;
}

export interface State {
	/** Is each basic recipe available? */
	basicRecipes: boolean[];
	/** Is each alternate recipe available? */
	alternateRecipes: boolean[];
	/** Every requested output. */
	products: NullableFlow[];
	/** Every available input. */
	inputs: NullableFlow[];
}

export const makeEmptyState = (): State => ({
	basicRecipes: BasicRecipes.map(() => true),
	alternateRecipes: AlternateRecipes.map(() => false),
	products: [],
	inputs: [],
});

export function buildDefaultInputs() {
	const ret = Array<NullableFlow>(defaultResourceData.size + 1);
	let i = 0;
	for (const [key, value] of defaultResourceData.entries()) {
		ret[i++] = { rate: value, item: key };
	}
	ret[i++] = { rate: null, item: Water };
	ret[i++] = { rate: null, item: FakePower };
	return ret;
}

export const { useSelector, update, getStateRaw } = makeStoreWithHashRouter(
	{
		serialize,
		deserialize,
		makeDefault() {
			const ret = makeEmptyState();
			ret.inputs = buildDefaultInputs();
			return ret;
		},
	},
	ROUTER_PLANNER_STORE,
	"_PlannerStore"
);

export function makeProblem(state: State): Problem {
	const res: Problem = {
		constraints: new Map(),
		power: null,
		clockFactor: BigRat.ONE,
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

	for (const { rate, item } of state.inputs) {
		if (item !== FakePower) {
			res.constraints.set(item, { constraint: "available", rate });
		} else {
			res.power = { constraint: "available", rate };
		}
	}
	for (const { rate, item } of state.products) {
		if (item !== FakePower) {
			res.constraints.set(item, { constraint: "produced", rate });
		} else {
			res.power = { constraint: "produced", rate };
		}
	}

	return res;
}
