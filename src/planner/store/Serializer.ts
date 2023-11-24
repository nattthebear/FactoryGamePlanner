import { readBigPos, readBigRat, readItem, RStream, writeBigPos, writeBigRat, writeItem, WStream } from "../../base64";
import { BigRat } from "../../math/BigRat";
import { makeEmptyState, NullableFlow, sortNullableFlowsMutate, State } from "./Store";

const VERSION = 0;

export function serialize(state: State) {
	const w = new WStream();

	w.write(6, VERSION);

	for (const b of state.basicRecipes) {
		w.write(1, +b);
	}
	for (const b of state.alternateRecipes) {
		w.write(1, +b);
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

	for (let i = 0; i < state.basicRecipes.length; i++) {
		state.basicRecipes[i] = !!r.read(1);
	}
	for (let i = 0; i < state.alternateRecipes.length; i++) {
		state.alternateRecipes[i] = !!r.read(1);
	}

	function readFlows() {
		const length = Number(readBigPos(r));
		const ret = Array<NullableFlow>(length);
		for (let i = 0; i < length; i++) {
			const rate = readBigRat(r);
			const item = readItem(r);
			if (!item) {
				console.warn(`Decode: Missing item`);
				return null;
			}
			ret[i] = {
				rate: rate.sign() <= 0 ? null : rate,
				item,
			};
		}
		return ret;
	}

	const products = readFlows();
	if (!products) {
		return null;
	}
	sortNullableFlowsMutate(products);
	state.products = products;

	const inputs = readFlows();
	if (!inputs) {
		return null;
	}
	sortNullableFlowsMutate(inputs);
	state.inputs = inputs;

	return state;
}
