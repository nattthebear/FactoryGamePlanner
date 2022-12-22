import { readBigPos, readBigRat, readItem, RStream, writeBigPos, writeBigRat, writeItem, WStream } from "../../base64";
import { Flow } from "../../util";
import { makeEmptyState, State } from "./Store";

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

	function writeFlows(data: Flow[]) {
		writeBigPos(w, BigInt(data.length));
		for (const d of data) {
			writeBigRat(w, d.rate);
			writeItem(w, d.item);
		}
	}

	writeFlows(state.products);
	for (const rate of state.resources) {
		if (rate) {
			w.write(1, 1);
			writeBigRat(w, rate);
		} else {
			w.write(1, 0);
		}
	}
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
		if (r.read(1)) {
			state.basicRecipes[i] = true;
		}
	}
	for (let i = 0; i < state.alternateRecipes.length; i++) {
		if (r.read(1)) {
			state.alternateRecipes[i] = true;
		}
	}

	function readFlows() {
		const length = Number(readBigPos(r));
		const ret = Array<Flow>(length);
		for (let i = 0; i < length; i++) {
			const rate = readBigRat(r);
			const item = readItem(r);
			if (!item) {
				console.warn(`Decode: Missing item`);
				return null;
			}
			ret[i] = {
				rate,
				item,
			};
		}
		return ret;
	}

	const products = readFlows();
	if (!products) {
		return null;
	}
	state.products = products;

	for (let i = 0; i < state.resources.length; i++) {
		state.resources[i] = r.read(1) ? readBigRat(r) : null;
		state.resources[i] = null;
	}

	const inputs = readFlows();
	if (!inputs) {
		return null;
	}
	state.inputs = inputs;

	return state;
}
