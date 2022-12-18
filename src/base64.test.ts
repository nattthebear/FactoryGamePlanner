import { describe, it } from "node:test";
import * as assert from "node:assert/strict";

import { RStream, WStream } from "./base64";

describe("RStream", () => {
	it("basic tests", () => {
		const r = new RStream("ABCDEFGH");

		assert.equal(r.read(6), 0);

		assert.equal(r.read(6), 1);

		assert.equal(r.read(1), 0);
		assert.equal(r.read(5), 1);

		assert.equal(r.read(3), 3);
		assert.equal(r.read(6), 32);
		assert.equal(r.read(3), 0);

		assert.equal(r.read(12), 0b000110_000101);

		assert.equal(r.read(25), 7);

		assert.equal(r.read(1), 0);

		assert.equal(r.read(32), 0);
	});
});

describe("WStream", () => {
	it("basic tests", () => {
		const w = new WStream();

		w.write(1, 1);
		assert.equal(w.finish(), "B");

		assert.equal(w.finish(), "");

		w.write(6, 0);
		assert.equal(w.finish(), "A");

		w.write(12, 0);
		assert.equal(w.finish(), "AA");

		w.write(2, 0);
		w.write(4, 15);
		assert.equal(w.finish(), "8");

		const BASE64_URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

		w.write(3, 2);
		w.write(6, 0b111_110);
		assert.equal(w.finish(), BASE64_URL[0b110010] + BASE64_URL[0b111]);

		w.write(32, 0b10101010111001010101001111011011);
		assert.equal(
			w.finish(),
			BASE64_URL[0b011011] +
				BASE64_URL[0b001111] +
				BASE64_URL[0b010101] +
				BASE64_URL[0b111001] +
				BASE64_URL[0b101010] +
				BASE64_URL[0b10]
		);
	});
});
