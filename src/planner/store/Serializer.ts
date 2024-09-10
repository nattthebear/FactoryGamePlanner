import { Recipes } from "../../../data/generated/recipes";
import type { Recipe } from "../../../data/types";
import { readBigPos, readBigRat, readItem, RStream, writeBigPos, writeBigRat, writeItem, WStream } from "../../base64";
import { BigRat } from "../../math/BigRat";
import { makeEmptyState, NullableFlow, sortNullableFlowsMutate, State } from "./Store";

const VERSION = 0;

type RecipeHole = "Basic" | "Alternate";

/** The type of every removed recipe from the game.  This is needed to properly sort VERSION === 0 urls. */
const removedRecipesById = new Map<number, RecipeHole>([
	[84, "Alternate"],
	[136, "Alternate"],
	[175, "Basic"],
]);

/** Recipes in normal serializer order, including any holes */
const orderedRecipeList = (() => {
	const ret: (Recipe | RecipeHole)[] = [];
	for (const r of Recipes) {
		const desiredIndex = r.SerializeId;
		if (desiredIndex < ret.length) {
			throw new Error("Duplicate SerializeId");
		}
		while (desiredIndex > ret.length) {
			const hole = removedRecipesById.get(ret.length);
			if (!hole) {
				throw new Error(`Missing recipe ${ret.length} hole type`);
			}
			ret.push(hole);
		}
		ret.push(r);
	}
	return ret;
})();

const versionZeroRecipeList = (() => {
	const ret = orderedRecipeList.slice(0, 204);
	const sortValue = (r: Recipe | RecipeHole): RecipeHole =>
		typeof r === "string" ? r : r.Alternate ? "Alternate" : "Basic";
	ret.sort((a, b) => {
		const sa = sortValue(a);
		const sb = sortValue(b);
		return sa < sb ? 1 : sa > sb ? -1 : 0;
	});
	return ret;
})();

export function serialize(state: State) {
	const w = new WStream();

	w.write(6, VERSION);

	for (const recipe of versionZeroRecipeList) {
		w.write(1, +(typeof recipe !== "string" && state.recipes.has(recipe)));
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

	for (const recipe of versionZeroRecipeList) {
		const b = !!r.read(1);
		if (typeof recipe !== "string") {
			if (b) {
				state.recipes.add(recipe);
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
