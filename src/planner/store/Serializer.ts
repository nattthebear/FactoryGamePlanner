import { Recipes } from "../../../data/generated/recipes";
import type { Recipe } from "../../../data/types";
import { readBigPos, readBigRat, readItem, RStream, writeBigPos, writeBigRat, writeItem, WStream } from "../../base64";
import { BigRat } from "../../math/BigRat";
import { makeEmptyState, NullableFlow, sortNullableFlowsMutate, State } from "./Store";

const VERSION = 0;

/** Recipes in the order they appear in the serialized output, including any holes */
const orderedRecipeList = (() => {
	const ret: (Recipe | null)[] = [];
	const sorted = Recipes.slice().sort((x, y) => x.PlannerSerializeId - y.PlannerSerializeId);
	for (const r of sorted) {
		const desiredIndex = r.PlannerSerializeId;
		if (desiredIndex < ret.length) {
			throw new Error("Duplicate PlannerSerializeId");
		}
		while (desiredIndex > ret.length) {
			ret.push(null);
		}
		ret.push(r);
	}
	return ret;
})();

export function serialize(state: State) {
	const w = new WStream();

	w.write(6, VERSION);

	for (const recipe of orderedRecipeList) {
		w.write(1, +(!!recipe && state.recipes.has(recipe)));
	}

	function writeFlows(data: NullableFlow[]) {
		writeBigPos(w, BigInt(data.length));
		for (const d of data) {
			writeBigRat(w, d.rate ?? BigRat.ZERO);
			writeItem(w, d.item);
		}
	}

	writeFlows(state.products);
	writeFlows(state.inputs);

	return w.finish();
}

export function deserialize(encoded: string) {
	const r = new RStream(encoded);

	const version = r.read(6);
	if (version !== VERSION) {
		console.warn(`Decode: version mismatch ${version} !== ${VERSION}`);
		return null;
	}

	const state = makeEmptyState();

	for (const recipe of orderedRecipeList) {
		const b = !!r.read(1);
		if (recipe) {
			if (b) {
				state.recipes.add(recipe);
			} else {
				state.recipes.delete(recipe);
			}
		}
	}

	function readFlows() {
		const length = Number(readBigPos(r));
		const ret: NullableFlow[] = [];
		for (let i = 0; i < length; i++) {
			const rate = readBigRat(r);
			const item = readItem(r);
			if (!item) {
				console.warn(`Decode: Missing item`);
			} else {
				ret.push({
					rate: rate.sign() <= 0 ? null : rate,
					item,
				});
			}
		}
		return ret;
	}

	const products = readFlows();
	sortNullableFlowsMutate(products);
	state.products = products;

	const inputs = readFlows();
	sortNullableFlowsMutate(inputs);
	state.inputs = inputs;

	return state;
}
