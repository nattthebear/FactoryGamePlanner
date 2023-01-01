import { describe, it } from "node:test";
import * as assert from "node:assert/strict";

import { gcd, BigRat } from "./BigRat";

describe("gcd", () => {
	it("basic tests", () => {
		assert.equal(gcd(4, 2), 2);
		assert.equal(gcd(0, 10), 10);
		assert.equal(gcd(10, 0), 10);
		assert.equal(gcd(1, 10), 1);
		assert.equal(gcd(10, 1), 1);
		assert.equal(gcd(0, 0), 0);
		assert.equal(gcd(1, 1), 1);
	});
	it("negatives", () => {
		// sign isn't important here; either gcd is valid
		assert.equal(Math.abs(gcd(-20, -20)), 20);
		assert.equal(Math.abs(gcd(-4, 20)), 4);
		assert.equal(Math.abs(gcd(20, -20)), 20);
		assert.equal(Math.abs(gcd(16, -24)), 8);
	});
});

describe("BigRat", () => {
	it("relations", () => {
		assert.equal(BigRat.eq(BigRat.create(1, 1), BigRat.create(1, 1)), true);
		assert.equal(BigRat.eq(BigRat.create(1, 3), BigRat.create(-1, -3)), true);
		assert.equal(BigRat.eq(BigRat.create(3, -7), BigRat.create(-6, 14)), true);
		assert.equal(BigRat.eq(BigRat.create(1, 1), BigRat.create(0, 1)), false);
		assert.equal(BigRat.gt(BigRat.create(4, 1), BigRat.create(3, 1)), true);
		assert.equal(BigRat.gt(BigRat.create(1, 1), BigRat.create(1, 1)), false);
		assert.equal(BigRat.gt(BigRat.create(22, 7), BigRat.create(314, 100)), true);
		assert.equal(BigRat.gt(BigRat.create(1, 1), BigRat.create(1, 1)), false);
		assert.equal(BigRat.gt(BigRat.create(4, 1), BigRat.create(3, 1)), true);
		assert.equal(BigRat.gt(BigRat.create(-4, -1), BigRat.create(-3, -1)), true);
		assert.equal(BigRat.gte(BigRat.create(1, 1), BigRat.create(1, 1)), true);
		assert.equal(BigRat.lt(BigRat.create(-1, 1), BigRat.create(1, 1)), true);
		assert.equal(BigRat.lt(BigRat.create(1, 1), BigRat.create(-1, 1)), false);
		assert.equal(BigRat.lte(BigRat.create(42, 10), BigRat.create(43, 10)), true);
		assert.equal(BigRat.lte(BigRat.create(42, 1), BigRat.create(42, 1)), true);
		assert.equal(BigRat.neq(BigRat.create(1, 1), BigRat.create(-1, -1)), false);
		assert.equal(BigRat.neq(BigRat.create(1, 1), BigRat.create(-1, 1)), true);
	});
	it("binary ops", () => {
		assert.equal(BigRat.eq(BigRat.add(BigRat.create(1, 1), BigRat.create(1, 1)), BigRat.create(2, 1)), true);
		assert.equal(BigRat.eq(BigRat.add(BigRat.create(1, 3), BigRat.create(1, 2)), BigRat.create(5, 6)), true);
		assert.equal(BigRat.eq(BigRat.add(BigRat.create(1, 3), BigRat.create(-1, 3)), BigRat.create(0, 1)), true);
		assert.equal(BigRat.eq(BigRat.sub(BigRat.create(1, 3), BigRat.create(1, 2)), BigRat.create(-1, 6)), true);
		assert.equal(BigRat.eq(BigRat.mul(BigRat.create(20, 3), BigRat.create(1, 2)), BigRat.create(10, 3)), true);
		assert.equal(BigRat.eq(BigRat.mul(BigRat.create(20, 3), BigRat.create(0, 2)), BigRat.create(0, 1)), true);
		assert.equal(BigRat.eq(BigRat.div(BigRat.create(100, 1), BigRat.create(4, 1)), BigRat.create(25, 1)), true);
		assert.throws(() => BigRat.div(BigRat.create(100, 1), BigRat.create(0, 4)));
	});
	it("parsing", () => {
		assert.equal(BigRat.tryParse("+123"), null);
		assert.equal(BigRat.tryParse("1e5"), null);
		assert.equal(BigRat.eq(BigRat.parse("123"), BigRat.create(123, 1)), true);
		assert.equal(BigRat.eq(BigRat.parse("-123"), BigRat.create(-123, 1)), true);
		assert.equal(BigRat.eq(BigRat.parse("12.00"), BigRat.create(12, 1)), true);
		assert.equal(BigRat.eq(BigRat.parse("1462.35"), BigRat.create(29247, 20)), true);
	});
	it("accessors", () => {
		const { p, q } = BigRat.create(561, 6457).terms();
		assert.equal(p, 51);
		assert.equal(q, 587);
		assert.equal(BigRat.create(25, 2).toNumberApprox(), 12.5);
	});
	it("sign", () => {
		assert.equal(BigRat.create(0, 1).sign(), 0);
		assert.equal(BigRat.create(0, -1).sign(), 0);
		assert.equal(BigRat.create(1, 1).sign(), 1);
		// assert.equal(BigRat.create(1, 100000000000000000000).sign(), 1);
		assert.equal(BigRat.create(1, -1).sign(), -1);
		assert.equal(BigRat.create(-1, 1).sign(), -1);
		assert.equal(BigRat.create(-1, -1).sign(), 1);
		assert.equal(BigRat.create(-250, 3).sign(), -1);
		assert.equal(BigRat.create(9, 1).div(BigRat.create(-2, 1)).sign(), -1);
	});
});
