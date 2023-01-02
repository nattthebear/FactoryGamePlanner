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
		assert.equal(new BigRat(1n, 1n).eq(new BigRat(1n, 1n)), true);
		assert.equal(new BigRat(1n, 3n).eq(new BigRat(-1n, -3n)), true);
		assert.equal(new BigRat(3n, -7n).eq(new BigRat(-6n, 14n)), true);
		assert.equal(new BigRat(1n, 1n).eq(new BigRat(0n, 1n)), false);
		assert.equal(new BigRat(4n, 1n).gt(new BigRat(3n, 1n)), true);
		assert.equal(new BigRat(1n, 1n).gt(new BigRat(1n, 1n)), false);
		assert.equal(new BigRat(22n, 7n).gt(new BigRat(314n, 100n)), true);
		assert.equal(new BigRat(1n, 1n).gt(new BigRat(1n, 1n)), false);
		assert.equal(new BigRat(4n, 1n).gt(new BigRat(3n, 1n)), true);
		assert.equal(new BigRat(-4n, -1n).gt(new BigRat(-3n, -1n)), true);
		assert.equal(new BigRat(1n, 1n).gte(new BigRat(1n, 1n)), true);
		assert.equal(new BigRat(-1n, 1n).lt(new BigRat(1n, 1n)), true);
		assert.equal(new BigRat(1n, 1n).lt(new BigRat(-1n, 1n)), false);
		assert.equal(new BigRat(42n, 10n).lte(new BigRat(43n, 10n)), true);
		assert.equal(new BigRat(42n, 1n).lte(new BigRat(42n, 1n)), true);
		assert.equal(new BigRat(1n, 1n).neq(new BigRat(-1n, -1n)), false);
		assert.equal(new BigRat(1n, 1n).neq(new BigRat(-1n, 1n)), true);
	});
	it("binary ops", () => {
		assert.equal(new BigRat(1n, 1n).add(new BigRat(1n, 1n)).eq(new BigRat(2n, 1n)), true);
		assert.equal(new BigRat(1n, 3n).add(new BigRat(1n, 2n)).eq(new BigRat(5n, 6n)), true);
		assert.equal(new BigRat(1n, 3n).add(new BigRat(-1n, 3n)).eq(new BigRat(0n, 1n)), true);
		assert.equal(new BigRat(1n, 3n).sub(new BigRat(1n, 2n)).eq(new BigRat(-1n, 6n)), true);
		assert.equal(new BigRat(20n, 3n).mul(new BigRat(1n, 2n)).eq(new BigRat(10n, 3n)), true);
		assert.equal(new BigRat(20n, 3n).mul(new BigRat(0n, 2n)).eq(new BigRat(0n, 1n)), true);
		assert.equal(new BigRat(100n, 1n).div(new BigRat(4n, 1n)).eq(new BigRat(25n, 1n)), true);
		assert.throws(() => new BigRat(100n, 1n).div(new BigRat(0n, 4n)));
	});
	it("parsing", () => {
		assert.equal(BigRat.tryParse("+123"), null);
		assert.equal(BigRat.tryParse("1e5"), null);
		assert.equal(BigRat.parse("123").eq(new BigRat(123n, 1n)), true);
		assert.equal(BigRat.parse("-123").eq(new BigRat(-123n, 1n)), true);
		assert.equal(BigRat.parse("12.00").eq(new BigRat(12n, 1n)), true);
		assert.equal(BigRat.parse("1462.35").eq(new BigRat(29247n, 20n)), true);
	});
	it("accessors", () => {
		const { p, q } = new BigRat(561n, 6457n).terms();
		assert.equal(p, 51n);
		assert.equal(q, 587n);
		assert.equal(new BigRat(25n, 2n).toNumberApprox(), 12.5);
	});
	it("sign", () => {
		assert.equal(new BigRat(0n, 1n).sign(), 0);
		assert.equal(new BigRat(0n, -1n).sign(), 0);
		assert.equal(new BigRat(1n, 1n).sign(), 1);
		assert.equal(new BigRat(1n, 100000000000000000000n).sign(), 1);
		assert.equal(new BigRat(1n, -1n).sign(), -1);
		assert.equal(new BigRat(-1n, 1n).sign(), -1);
		assert.equal(new BigRat(-1n, -1n).sign(), 1);
		assert.equal(new BigRat(-250n, 3n).sign(), -1);
	});
});
