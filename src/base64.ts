import { Items } from "../data/generated/items";
import { Recipes } from "../data/generated/recipes";
import { ItemsWithFakePower } from "../data/power";
import { BigRat } from "./math/BigRat";

const BASE64_URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE64_URL_REV = new Map(BASE64_URL.split("").map((c, i) => [c, i]));

export class RStream {
	private index = -1;
	private shift = 6;
	private current = 0;
	constructor(private s: string) {}

	/** read up to 32 bits of data */
	read(len: number) {
		let output = 0;
		let outputShift = 0;
		while (outputShift < len) {
			if (this.shift === 6) {
				this.shift = 0;
				this.index++;
				this.current = BASE64_URL_REV.get(this.s[this.index]) ?? 0;
			}
			const n = Math.min(len - outputShift, 6 - this.shift);
			const v = ((this.current >> this.shift) << (32 - n)) >>> (32 - n - outputShift);
			output |= v;
			outputShift += n;
			this.shift += n;
		}
		return output;
	}
}

export class WStream {
	private shift = 0;
	private current = 0;
	private res: string[] = [];

	/** write up to 32 bits of data */
	write(len: number, value: number) {
		let inputShift = 0;
		while (inputShift < len) {
			if (this.shift === 6) {
				this.res.push(BASE64_URL[this.current]);
				this.shift = 0;
				this.current = 0;
			}
			const n = Math.min(len - inputShift, 6 - this.shift);
			const v = ((value >> inputShift) << (32 - n)) >>> (32 - n - this.shift);
			this.current |= v;
			inputShift += n;
			this.shift += n;
		}
	}

	finish() {
		if (this.shift > 0) {
			this.res.push(BASE64_URL[this.current]);
		}
		const res = this.res.join("");
		this.shift = 0;
		this.current = 0;
		this.res.length = 0;
		return res;
	}
}

/** Number of bits needed to encode this positive value as a fixed-bit-width integer */
export function bitsNeeded(value: number) {
	return 32 - Math.clz32(value);
}
/** Write a non-negative bigint value */
export function writeBigPos(w: WStream, n: bigint) {
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
/** Read a non-negative bigint value */
export function readBigPos(r: RStream) {
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
/** Write a BigRat value */
export function writeBigRat(w: WStream, value: BigRat) {
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
/** Read a BigRat value */
export function readBigRat(r: RStream) {
	const neg = r.read(1);
	let p = readBigPos(r);
	const q = readBigPos(r);
	if (neg) {
		p = -p;
	}
	return BigRat.fromBigInts(p, q);
}

function makeWMapImpl<T>(map: Map<T, number>, maxValue: number) {
	const BITS = maxValue > 0 ? bitsNeeded(maxValue) : 0;
	function write(w: WStream, v: T) {
		const n = map.get(v);
		if (n == null) {
			throw new Error("Passed value was not part of original map set");
		}
		w.write(BITS, n);
	}
	write.BITS = BITS;
	return write;
}

function makeRMapImpl<T>(map: Map<number, T>, maxValue: number) {
	const BITS = maxValue > 0 ? bitsNeeded(maxValue) : 0;
	function read(r: RStream) {
		const value = r.read(BITS);
		if (map.has(value)) {
			return map.get(value)!;
		}
		return null;
	}
	read.BITS = BITS;
	return read;
}

/** Makes a compressing map to store a set of ids with the minimum number of bits */
export function makeWMap<T>(keys: Iterable<T>) {
	const map = new Map<T, number>();
	let i = 0;
	for (const k of keys) {
		map.set(k, i++);
	}
	const maxValue = Math.max(i - 1, 0);
	return makeWMapImpl(map, maxValue);
}

/** Makes a pair of functions to store and load objects by predetermined ids */
export function makeStableReversibleMap<T extends { SerializeId: number }>(data: Iterable<T>) {
	const wmap = new Map<T, number>();
	const rmap = new Map<number, T>();
	let maxId = 0;
	for (const item of data) {
		const id = item.SerializeId;
		if (id > maxId) {
			maxId = id;
		}
		if (wmap.has(item)) {
			throw new Error("Duplicate item");
		}
		if (rmap.has(id)) {
			throw new Error("Duplicate id");
		}
		wmap.set(item, id);
		rmap.set(id, item);
	}

	return {
		write: makeWMapImpl(wmap, maxId),
		read: makeRMapImpl(rmap, maxId),
	};
}

export const { write: writeRecipe, read: readRecipe } = makeStableReversibleMap(Recipes);
export const { write: writeItem, read: readItem } = makeStableReversibleMap(ItemsWithFakePower);
