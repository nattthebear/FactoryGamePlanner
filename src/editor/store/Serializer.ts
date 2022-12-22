import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { Item, Recipe } from "../../../data/types";
import { RStream, WStream } from "../../base64";
import { BigRat } from "../../math/BigRat";
import { FACTORY_MAX, FACTORY_MIN } from "../../util";
import { generateId, NodeId } from "./Common";
import { Connector } from "./Connectors";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { makeEmptyState, State } from "./Store";

const VERSION = 0;

/** Number of bits needed to encode this positive value as a fixed-bit-width integer */
function bitsNeeded(value: number) {
	return 32 - Math.clz32(value);
}

function writeBigPos(w: WStream, n: bigint) {
	while (true) {
		const more = +(n !== 0n);
		w.write(1, more);
		if (!more) {
			return;
		}
		w.write(6, Number(n & 63n));
		n >>= 6n;
	}
}
function readBigPos(r: RStream) {
	let n = 0n;
	let shift = 0n;
	while (true) {
		const more = r.read(1);
		if (!more) {
			return n;
		}
		const next = BigInt(r.read(6));
		n |= next << shift;
		shift += 6n;
	}
}

function writeBigRat(w: WStream, value: BigRat) {
	let { p, q } = value.terms();
	if (q < 0) {
		q = -q;
		p = -p;
	}
	const neg = +(p < 0);
	w.write(1, neg);
	if (neg) {
		p = -p;
	}
	writeBigPos(w, p);
	writeBigPos(w, q);
}
function readBigRat(r: RStream) {
	const neg = r.read(1);
	let p = readBigPos(r);
	const q = readBigPos(r);
	if (neg) {
		p = -p;
	}
	return new BigRat(p, q);
}

const { saveX, saveY, loadX, loadY } = (() => {
	const xoffs = FACTORY_MIN.x;
	const yoffs = FACTORY_MIN.y;

	const xbits = bitsNeeded(FACTORY_MAX.x - xoffs);
	const ybits = bitsNeeded(FACTORY_MAX.y - yoffs);
	return {
		saveX(w: WStream, x: number) {
			w.write(xbits, (x - xoffs) >>> 0);
		},
		saveY(w: WStream, y: number) {
			w.write(ybits, (y - yoffs) >>> 0);
		},
		loadX(r: RStream) {
			return r.read(xbits) + xoffs;
		},
		loadY(r: RStream) {
			return r.read(ybits) + yoffs;
		},
	};
})();

/** Makes a compressing map to store a set of ids with the minimum number of bits */
function makeWMap<T>(keys: Iterable<T>) {
	const map = new Map<T, number>();
	let i = 0;
	for (const k of keys) {
		map.set(k, i++);
	}
	const BITS = i > 0 ? bitsNeeded(i - 1) : 0;
	function write(w: WStream, v: T) {
		const n = map.get(v);
		if (n == null) {
			throw new Error("Internal ID error");
		}
		w.write(BITS, n);
	}
	write.BITS = BITS;
	return write;
}
function makeRMap<T>(data: T[]) {
	const i = data.length;
	const BITS = i > 0 ? bitsNeeded(i - 1) : 0;
	function read(r: RStream) {
		const value = r.read(BITS);
		if (value < data.length) {
			return data[value];
		}
		return null;
	}
	read.BITS = BITS;
	return read;
}

const writeRecipe = makeWMap(Recipes);
const writeItem = makeWMap(Items);
const readRecipe = makeRMap(Recipes);
const readItem = makeRMap(Items);

export function serialize(state: State) {
	const w = new WStream();

	w.write(6, VERSION);

	const writePId = makeWMap(state.producers.keys());
	writeBigPos(w, BigInt(writePId.BITS));

	for (const c of state.connectors.values()) {
		if (c.rate.eq(BigRat.ZERO)) {
			throw new Error();
		}
		writeBigRat(w, c.rate);
		writeItem(w, c.item);
		writePId(w, c.input);
		writePId(w, c.output);
		w.write(2, c.inputIndex);
		w.write(2, c.outputIndex);
	}
	writeBigRat(w, BigRat.ZERO);

	for (const p of state.producers.values()) {
		if (p instanceof ProductionBuilding) {
			w.write(2, 0);
			writeRecipe(w, p.recipe);
		} else if (p instanceof Sink) {
			w.write(2, 1);
			writeItem(w, p.item);
		} else if (p instanceof Source) {
			w.write(2, 2);
			writeItem(w, p.item);
		} else {
			throw new Error("Internal ptype error");
		}
		saveX(w, p.x);
		saveY(w, p.y);
		writeBigRat(w, p.rate);
	}
	w.write(2, 3);

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

	const P_BITS = Number(readBigPos(r));

	const producers: Producer[] = [];

	const tempConnectors: {
		rate: BigRat;
		item: Item;
		inId: number;
		outId: number;
		inputIndex: number;
		outputIndex: number;
	}[] = [];

	while (true) {
		const rate = readBigRat(r);
		if (rate.eq(BigRat.ZERO)) {
			break;
		}
		if (rate.lt(BigRat.ZERO)) {
			console.warn(`Decode: negative rate`);
			return null;
		}
		const item = readItem(r);
		if (!item) {
			console.warn(`Decode: missing item`);
			return null;
		}
		const inId = r.read(P_BITS);
		const outId = r.read(P_BITS);
		const inputIndex = r.read(2);
		const outputIndex = r.read(2);
		tempConnectors.push({
			rate,
			item,
			inId,
			outId,
			inputIndex,
			outputIndex,
		});
	}

	while (true) {
		const type = r.read(2);
		let recipe: Recipe | null = null;
		let item: Item | null = null;
		if (type === 3) {
			break;
		}
		if (type === 0) {
			recipe = readRecipe(r);
		} else {
			item = readItem(r);
		}
		const x = loadX(r);
		const y = loadY(r);
		const rate = readBigRat(r);
		if (rate.lte(BigRat.ZERO)) {
			console.warn(`Decode: negative or zero rate`);
			return null;
		}
		let producer: Producer;
		if (type === 0) {
			if (!recipe) {
				console.warn(`Decode: missing recipe`);
				return null;
			}
			producer = new ProductionBuilding(x, y, rate, recipe);
		} else if (type === 1) {
			if (!item) {
				console.warn(`Decode: missing item`);
				return null;
			}
			producer = new Sink(x, y, rate, item);
		} else if (type === 2) {
			if (!item) {
				console.warn(`Decode: missing item`);
				return null;
			}
			producer = new Source(x, y, rate, item);
		} else {
			console.warn(`Decode: internal error`);
			return null;
		}
		producers.push(producer);
	}

	const connectors: Connector[] = [];
	for (const temp of tempConnectors) {
		const inputp = producers[temp.inId];
		const outputp = producers[temp.outId];
		if (!inputp || !outputp) {
			console.warn(`Decode: bad producer ref`);
			return null;
		}
		connectors.push(new Connector(temp.rate, temp.item, inputp.id, outputp.id, temp.inputIndex, temp.outputIndex));
	}

	state.connectors = new Map(connectors.map((c) => [c.id, c]));
	state.producers = new Map(producers.map((p) => [p.id, p]));

	for (const c of connectors) {
		const pout = state.producers.get(c.output)!;
		if (pout.inputFlows()[c.outputIndex].item !== c.item) {
			console.warn(
				`Decode: Connection item mismatch ${pout.inputFlows()[c.outputIndex].item.ClassName} !== ${
					c.item.ClassName
				}`
			);
			return null;
		}
		const pin = state.producers.get(c.input)!;
		if (pin.outputFlows()[c.inputIndex].item !== c.item) {
			console.warn(
				`Decode: Connection item mismatch ${pin.outputFlows()[c.inputIndex].item.ClassName} !== ${
					c.item.ClassName
				}`
			);
			return null;
		}

		pout.inputs[c.outputIndex].push(c.id);
		pin.outputs[c.inputIndex].push(c.id);
	}

	return state;
}
