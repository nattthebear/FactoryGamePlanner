import { BigRat } from "./math/BigRat";

export {};

class XorShift32 {
	private state: number;

	constructor(seed: number) {
		seed = seed | 0;
		if (!seed) {
			throw new Error("Seed must be non-zero");
		}
		this.state = seed;
	}

	next() {
		let x = this.state;
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		return (this.state = x) >>> 0;
	}
}

function foobazJs(seed: number, rounds: number) {
	const r = new XorShift32(seed);
	let acc = BigRat.ONE;
	while (rounds != 0) {
		const p = r.next();
		const q = r.next();

		const val = new BigRat(BigInt(p), BigInt(q));
		acc = acc.sub(val);
		rounds -= 1;
	}

	let { p } = acc.terms();
	if (p < 0n) {
		p = -p;
	}
	const res = Number(p & 0xffffffffn) | 0;
	return res;
}

(async () => {
	const url = new URL("../rmath/target/wasm32-unknown-unknown/release/rmath.wasm", import.meta.url);
	const { instance, module } = await WebAssembly.instantiateStreaming(fetch(url), {});
	const { test_num_bigint, test_ibig, test_num_ratio_i128 } = instance.exports;

	window.testFn = function testFn(seed: number, rounds: number) {
		let ms = performance.now();
		function mark() {
			const nextMs = performance.now();
			const delta = nextMs - ms;
			console.log(`Marked time: ${delta}ms`);
			ms = nextMs;
		}
		console.log("Wasm (BigInt)");
		console.log((test_num_bigint as any)(seed, rounds));
		mark();
		console.log("Wasm (IBig)");
		console.log((test_ibig as any)(seed, rounds));
		mark();
		console.log("Wasm (Ratio<i128>)");
		console.log((test_num_ratio_i128 as any)(seed, rounds));
		mark();
		console.log("JS:");
		console.log(foobazJs(seed, rounds));
		mark();
	};
})();
