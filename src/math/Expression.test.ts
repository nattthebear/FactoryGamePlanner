import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { evaluate, ParserResult } from "./Expression";
import { BigRat } from "./BigRat";

describe("evaluate", () => {
	function assertSuccess(res: ParserResult<BigRat>, expected: BigRat) {
		if (!res.ok) {
			assert.fail(`Not OK: ${res.message} [${res.index}]`);
		}
		assert.equal(BigRat.eq(res.value, expected), true);
	}
	function assertFailure(res: ParserResult<BigRat>) {
		assert.equal(res.ok, false);
	}
	it("constant only", () => {
		assertSuccess(evaluate("1234"), new BigRat(1234n, 1n));
		assertSuccess(evaluate(" 12345      "), new BigRat(12345n, 1n));
		assertSuccess(evaluate(" 124.745321      "), BigRat.parse("124.745321"));
		assertSuccess(evaluate(".125346"), BigRat.parse("0.125346"));
		assertSuccess(evaluate("4369765."), new BigRat(4369765n, 1n));
		assertSuccess(evaluate("3445e2"), new BigRat(344500n, 1n));
		assertSuccess(evaluate("1.4578934e+4"), BigRat.parse("14578.934"));
		assertSuccess(evaluate("41e-20"), new BigRat(41n, 1n).div(new BigRat(100000000000000000000n, 1n)));

		assertFailure(evaluate("."));
		assertFailure(evaluate("4 e 14"));
	});
	it("addsub", () => {
		assertSuccess(evaluate("1 + 1"), BigRat.parse("2"));
		assertSuccess(evaluate("1+1"), BigRat.parse("2"));
		assertSuccess(evaluate("   1 +    154 "), BigRat.parse("155"));
		assertSuccess(evaluate("0.1+0.2"), BigRat.parse("0.3"));

		assertFailure(evaluate(" 1 + + + 4"));

		assertSuccess(evaluate("  7 - 3"), BigRat.parse("4"));
		assertSuccess(evaluate(" 1-2+3-4+5"), BigRat.parse("3"));
	});

	it("muldiv", () => {
		assertSuccess(evaluate("4 * 6"), BigRat.parse("24"));
		assertSuccess(evaluate("4*6"), BigRat.parse("24"));
		assertSuccess(evaluate("            4*6 "), BigRat.parse("24"));
		assertSuccess(evaluate("312/5"), BigRat.parse("62.4"));
		assertSuccess(evaluate("1243/213*547/876"), new BigRat(679921n, 186588n));
		assertFailure(evaluate("3 * *1"));
		assertFailure(evaluate("3 **1"));
		assertFailure(evaluate("4  * 1 /"));
		assertFailure(evaluate("/"));
		assertFailure(evaluate("5 / 0")); // fixme
	});

	it("unary ops", () => {
		assertSuccess(evaluate("-5"), new BigRat(5n, -1n));
		assertSuccess(evaluate("+5"), new BigRat(5n, 1n));
		assertSuccess(evaluate("-5--5"), new BigRat(0n, 1n));
		assertSuccess(evaluate("+5+-13"), new BigRat(-8n, 1n));
		assertSuccess(evaluate(" -    3* 5"), new BigRat(-15n, 1n));
	});
});
