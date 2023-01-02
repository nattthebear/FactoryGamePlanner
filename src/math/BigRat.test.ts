import { describe, it } from "node:test";
import * as assert from "node:assert/strict";

import { gcd, abs, BigRat } from "./BigRat";

describe("gcd", () => {
	it("basic tests", () => {
		assert.equal(gcd(4n, 2n), 2n);
		assert.equal(gcd(0n, 10n), 10n);
		assert.equal(gcd(10n, 0n), 10n);
		assert.equal(gcd(1n, 10n), 1n);
		assert.equal(gcd(10n, 1n), 1n);
		assert.equal(gcd(0n, 0n), 0n);
		assert.equal(gcd(1n, 1n), 1n);
	});
	it("negatives", () => {
		// sign isn't important here; either gcd is valid
		assert.equal(abs(gcd(-20n, -20n)), 20n);
		assert.equal(abs(gcd(-4n, 20n)), 4n);
		assert.equal(abs(gcd(20n, -20n)), 20n);
		assert.equal(abs(gcd(16n, -24n)), 8n);
	});
});

describe("BigRat", () => {
	it("relations", () => {
		assert.equal(BigRat.fromIntegers(1, 1).eq(BigRat.fromIntegers(1, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 3).eq(BigRat.fromIntegers(-1, -3)), true);
		assert.equal(BigRat.fromIntegers(3, -7).eq(BigRat.fromIntegers(-6, 14)), true);
		assert.equal(BigRat.fromIntegers(1, 1).eq(BigRat.fromIntegers(0, 1)), false);
		assert.equal(BigRat.fromIntegers(4, 1).gt(BigRat.fromIntegers(3, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 1).gt(BigRat.fromIntegers(1, 1)), false);
		assert.equal(BigRat.fromIntegers(22, 7).gt(BigRat.fromIntegers(314, 100)), true);
		assert.equal(BigRat.fromIntegers(1, 1).gt(BigRat.fromIntegers(1, 1)), false);
		assert.equal(BigRat.fromIntegers(4, 1).gt(BigRat.fromIntegers(3, 1)), true);
		assert.equal(BigRat.fromIntegers(-4, -1).gt(BigRat.fromIntegers(-3, -1)), true);
		assert.equal(BigRat.fromIntegers(1, 1).gte(BigRat.fromIntegers(1, 1)), true);
		assert.equal(BigRat.fromIntegers(-1, 1).lt(BigRat.fromIntegers(1, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 1).lt(BigRat.fromIntegers(-1, 1)), false);
		assert.equal(BigRat.fromIntegers(42, 10).lte(BigRat.fromIntegers(43, 10)), true);
		assert.equal(BigRat.fromIntegers(42, 1).lte(BigRat.fromIntegers(42, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 1).neq(BigRat.fromIntegers(-1, -1)), false);
		assert.equal(BigRat.fromIntegers(1, 1).neq(BigRat.fromIntegers(-1, 1)), true);
	});
	it("binary ops", () => {
		assert.equal(BigRat.fromIntegers(1, 1).add(BigRat.fromIntegers(1, 1)).eq(BigRat.fromIntegers(2, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 3).add(BigRat.fromIntegers(1, 2)).eq(BigRat.fromIntegers(5, 6)), true);
		assert.equal(BigRat.fromIntegers(1, 3).add(BigRat.fromIntegers(-1, 3)).eq(BigRat.fromIntegers(0, 1)), true);
		assert.equal(BigRat.fromIntegers(1, 3).sub(BigRat.fromIntegers(1, 2)).eq(BigRat.fromIntegers(-1, 6)), true);
		assert.equal(BigRat.fromIntegers(20, 3).mul(BigRat.fromIntegers(1, 2)).eq(BigRat.fromIntegers(10, 3)), true);
		assert.equal(BigRat.fromIntegers(20, 3).mul(BigRat.fromIntegers(0, 2)).eq(BigRat.fromIntegers(0, 1)), true);
		assert.equal(BigRat.fromIntegers(100, 1).div(BigRat.fromIntegers(4, 1)).eq(BigRat.fromIntegers(25, 1)), true);
		assert.throws(() => BigRat.fromIntegers(100, 1).div(BigRat.fromIntegers(0, 4)));
	});
	it("parsing", () => {
		assert.equal(BigRat.tryParse("+123"), null);
		assert.equal(BigRat.tryParse("1e5"), null);
		assert.equal(BigRat.parse("123").eq(BigRat.fromIntegers(123, 1)), true);
		assert.equal(BigRat.parse("-123").eq(BigRat.fromIntegers(-123, 1)), true);
		assert.equal(BigRat.parse("12.00").eq(BigRat.fromIntegers(12, 1)), true);
		assert.equal(BigRat.parse("1462.35").eq(BigRat.fromIntegers(29247, 20)), true);
	});
	it("accessors", () => {
		const { p, q } = BigRat.fromIntegers(561, 6457).terms();
		assert.equal(p, 51n);
		assert.equal(q, 587n);
		assert.equal(BigRat.fromIntegers(25, 2).toNumberApprox(), 12.5);
	});
	it("sign", () => {
		assert.equal(BigRat.fromIntegers(0, 1).sign(), 0);
		assert.equal(BigRat.fromIntegers(0, -1).sign(), 0);
		assert.equal(BigRat.fromIntegers(1, 1).sign(), 1);
		assert.equal(BigRat.fromBigInts(1n, 100000000000000000000n).sign(), 1);
		assert.equal(BigRat.fromIntegers(1, -1).sign(), -1);
		assert.equal(BigRat.fromIntegers(-1, 1).sign(), -1);
		assert.equal(BigRat.fromIntegers(-1, -1).sign(), 1);
		assert.equal(BigRat.fromIntegers(-250, 3).sign(), -1);
	});
});
