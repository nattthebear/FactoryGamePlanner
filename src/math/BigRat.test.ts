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
		assert.equal(BigRat.eq(new BigRat(1n, 1n), new BigRat(1n, 1n)), true);
		assert.equal(BigRat.eq(new BigRat(1n, 3n), new BigRat(-1n, -3n)), true);
		assert.equal(BigRat.eq(new BigRat(3n, -7n), new BigRat(-6n, 14n)), true);
		assert.equal(BigRat.eq(new BigRat(1n, 1n), new BigRat(0n, 1n)), false);
		assert.equal(BigRat.gt(new BigRat(4n, 1n), new BigRat(3n, 1n)), true);
		assert.equal(BigRat.gt(new BigRat(1n, 1n), new BigRat(1n, 1n)), false);
		assert.equal(BigRat.gt(new BigRat(22n, 7n), new BigRat(314n, 100n)), true);
		assert.equal(BigRat.gt(new BigRat(1n, 1n), new BigRat(1n, 1n)), false);
		assert.equal(BigRat.gt(new BigRat(4n, 1n), new BigRat(3n, 1n)), true);
		assert.equal(BigRat.gt(new BigRat(-4n, -1n), new BigRat(-3n, -1n)), true);
		assert.equal(BigRat.gte(new BigRat(1n, 1n), new BigRat(1n, 1n)), true);
		assert.equal(BigRat.lt(new BigRat(-1n, 1n), new BigRat(1n, 1n)), true);
		assert.equal(BigRat.lt(new BigRat(1n, 1n), new BigRat(-1n, 1n)), false);
		assert.equal(BigRat.lte(new BigRat(42n, 10n), new BigRat(43n, 10n)), true);
		assert.equal(BigRat.lte(new BigRat(42n, 1n), new BigRat(42n, 1n)), true);
		assert.equal(BigRat.neq(new BigRat(1n, 1n), new BigRat(-1n, -1n)), false);
		assert.equal(BigRat.neq(new BigRat(1n, 1n), new BigRat(-1n, 1n)), true);
	});
	it("binary ops", () => {
		assert.equal(BigRat.eq(BigRat.add(new BigRat(1n, 1n), new BigRat(1n, 1n)), new BigRat(2n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.add(new BigRat(1n, 3n), new BigRat(1n, 2n)), new BigRat(5n, 6n)), true);
		assert.equal(BigRat.eq(BigRat.add(new BigRat(1n, 3n), new BigRat(-1n, 3n)), new BigRat(0n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.sub(new BigRat(1n, 3n), new BigRat(1n, 2n)), new BigRat(-1n, 6n)), true);
		assert.equal(BigRat.eq(BigRat.mul(new BigRat(20n, 3n), new BigRat(1n, 2n)), new BigRat(10n, 3n)), true);
		assert.equal(BigRat.eq(BigRat.mul(new BigRat(20n, 3n), new BigRat(0n, 2n)), new BigRat(0n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.div(new BigRat(100n, 1n), new BigRat(4n, 1n)), new BigRat(25n, 1n)), true);
		assert.throws(() => BigRat.div(new BigRat(100n, 1n), new BigRat(0n, 4n)));
	});
	it("parsing", () => {
		assert.equal(BigRat.tryParse("+123"), null);
		assert.equal(BigRat.tryParse("1e5"), null);
		assert.equal(BigRat.eq(BigRat.parse("123"), new BigRat(123n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.parse("-123"), new BigRat(-123n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.parse("12.00"), new BigRat(12n, 1n)), true);
		assert.equal(BigRat.eq(BigRat.parse("1462.35"), new BigRat(29247n, 20n)), true);
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
