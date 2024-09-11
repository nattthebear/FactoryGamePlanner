import { defaultResourceData } from "../../../data/defaultResources";
import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { ItemsByClassName } from "../../../data/lookups";
import { FakePower } from "../../../data/power";
import { Item, Recipe } from "../../../data/types";
import { makeStoreWithHashRouter, ROUTER_PLANNER_STORE } from "../../MakeHashRouterStore";
import { BigRat } from "../../math/BigRat";
import { Problem } from "../../solver/Solver";
import { deserialize, serialize } from "./Serializer";

export const BasicRecipes = Recipes.filter((r) => !r.Alternate);
export const AlternateRecipes = Recipes.filter((r) => r.Alternate);
export const Resources = Items.filter((r) => r.IsResource);

// Conversion recipes can be useful, and the system can handle them, but the way they interact with the
// default constraints can be confusing.  Turn them off by default.
const DefaultRecipes = BasicRecipes.filter((r) => !(r.Outputs.length && r.Outputs.every((o) => o.Item.IsResource)));

const Water = ItemsByClassName.get("Desc_Water_C")!;

export interface NullableFlow {
	rate: BigRat | null;
	item: Item;
}

export function sortNullableFlowsMutate(flows: NullableFlow[]) {
	flows.sort((a, b) => a.item.SortOrder - b.item.SortOrder);
}

export interface State {
	/** What recipes are available? */
	recipes: Set<Recipe>;
	/** Every requested output. */
	products: NullableFlow[];
	/** Every available input. */
	inputs: NullableFlow[];
}

export const makeEmptyState = (): State => ({
	recipes: new Set(),
	products: [],
	inputs: [],
});

export const makeDefaultState = (): State => ({
	recipes: new Set(DefaultRecipes),
	products: [],
	inputs: buildDefaultInputs(),
});

export function buildDefaultInputs() {
	const ret: NullableFlow[] = [];
	let i = 0;
	for (const [key, value] of defaultResourceData.entries()) {
		ret[i++] = { rate: value, item: key };
	}
	ret[i++] = { rate: null, item: Water };
	ret[i++] = { rate: null, item: FakePower };
	sortNullableFlowsMutate(ret);
	return ret;
}

export const { useSelector, update, getStateRaw } = makeStoreWithHashRouter(
	{
		serialize,
		deserialize,
		makeDefault: makeDefaultState,
	},
	ROUTER_PLANNER_STORE,
	"_PlannerStore",
);

export function makeProblem(state: State): Problem {
	const res: Problem = {
		constraints: new Map(),
		power: null,
		clockFactor: BigRat.ONE,
		availableRecipes: new Set(state.recipes),
	};

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
