import { defaultResourceData } from "../../../data/defaultResources";
import { RawItems } from "../../../data/generated/items";
import {RawRecipes } from "../../../data/generated/recipes";
import { ItemsByClassName } from "../../../data/lookups";
import { FakePower } from "../../../data/power";
import { Item } from "../../../data/types";
import { makeStoreWithHashRouter, ROUTER_PLANNER_STORE } from "../../MakeHashRouterStore";
import { BigRat } from "../../math/BigRat";
import { Problem } from "../../solver/Solver";
import { filterNulls } from "../../util";
import { deserialize, serialize } from "./Serializer";

// When recipies have been retired, remember whether they were advanced or not to place
// the right holes in basic and alternate lists for serialization
const wasAlternate = new Map([
	[136,true],
	[175,false]
]);

const makeRecipeSublist = (desiredAlternate:boolean)=> RawRecipes.filter((r, index) => {
	const alternate = r?.Alternate ?? wasAlternate.get(index);
	if (alternate == null) {throw new Error}
	return alternate === desiredAlternate;
})

export const RawBasicRecipes = makeRecipeSublist(false);
export const RawAlternateRecipes = makeRecipeSublist(true);
export const Resources = filterNulls (RawItems ).filter((i) => i.IsResource);

const Water = ItemsByClassName.get("Desc_Water_C")!;

export interface NullableFlow {
	rate: BigRat | null;
	item: Item;
}

export function sortNullableFlowsMutate(flows: NullableFlow[]) {
	flows.sort((a, b) => a.item.SortOrder - b.item.SortOrder);
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
	basicRecipes: RawBasicRecipes.map(() => true),
	alternateRecipes: RawAlternateRecipes.map(() => false),
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
	sortNullableFlowsMutate(ret);
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
	"_PlannerStore",
);

export function makeProblem(state: State): Problem {
	const res: Problem = {
		constraints: new Map(),
		power: null,
		clockFactor: BigRat.ONE,
		availableRecipes: new Set(),
	};

	for (let i = 0; i < RawBasicRecipes.length; i++) {
		const recipe = RawBasicRecipes[i];
		if (recipe && state.basicRecipes[i]) {
			res.availableRecipes.add(recipe);
		}
	}
	for (let i = 0; i < RawAlternateRecipes.length; i++) {
		const recipe = RawAlternateRecipes[i];
		if (recipe && state.alternateRecipes[i]) {
			res.availableRecipes.add(recipe);
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
