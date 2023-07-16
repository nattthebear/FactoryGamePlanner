import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { evaluate, EvalResult } from "./Expression";
import { BigRat } from "./BigRat";

describe("evaluate", () => {
	function assertSuccess(res: EvalResult, expected: BigRat) {
		if (!res.ok) {
			assert.fail(`Not OK: ${res.message} [${res.offset}]`);
		}
		assert.equal(res.value.eq(expected), true);
	}
	function assertFailure(res: EvalResult, expectedLocation: number) {
		if (res.ok) {
			assert.fail(`Was OK! ${res.value.debug()}`);
		}
		assert.equal(res.offset, expectedLocation);
	}
	it("constant only", () => {
		assertSuccess(evaluate("1234"), BigRat.fromIntegers(1234, 1));
		assertSuccess(evaluate(" 12345      "), BigRat.fromIntegers(12345, 1));
		assertSuccess(evaluate(" 124.745321      "), BigRat.parse("124.745321"));
		assertSuccess(evaluate(".125346"), BigRat.parse("0.125346"));
		assertSuccess(evaluate("4369765."), BigRat.fromIntegers(4369765, 1));
		assertSuccess(evaluate("3445e2"), BigRat.fromIntegers(344500, 1));
		assertSuccess(evaluate("1.4578934e+4"), BigRat.parse("14578.934"));
		assertSuccess(
			evaluate("41e-20"),
			BigRat.fromIntegers(41, 1).div(BigRat.fromBigInts(100000000000000000000n, 1n)),
		);
		assertSuccess(evaluate("."), BigRat.ZERO);

		assertFailure(evaluate("4 e 14"), 2);
	});
	it("addsub", () => {
		assertSuccess(evaluate("1 + 1"), BigRat.parse("2"));
		assertSuccess(evaluate("1+1"), BigRat.parse("2"));
		assertSuccess(evaluate("   1 +    154 "), BigRat.parse("155"));
		assertSuccess(evaluate("0.1+0.2"), BigRat.parse("0.3"));

		assertFailure(evaluate(" 1 + + + 4"), 7);

		assertSuccess(evaluate("  7 - 3"), BigRat.parse("4"));
		assertSuccess(evaluate(" 1-2+3-4+5"), BigRat.parse("3"));
	});

	it("muldiv", () => {
		assertSuccess(evaluate("4 * 6"), BigRat.parse("24"));
		assertSuccess(evaluate("4*6"), BigRat.parse("24"));
		assertSuccess(evaluate("            4*6 "), BigRat.parse("24"));
		assertSuccess(evaluate("312/5"), BigRat.parse("62.4"));
		assertSuccess(evaluate("1243/213*547/876"), BigRat.fromIntegers(679921, 186588));
		assertFailure(evaluate("3 * *1"), 4);
		assertFailure(evaluate("3 **1"), 3);
		assertFailure(evaluate("4  * 1 /"), 8);
		assertFailure(evaluate("/"), 0);
		assertFailure(evaluate("5 / 0"), 2);
	});

	it("unary ops", () => {
		assertSuccess(evaluate("-5"), BigRat.fromIntegers(5, -1));
		assertSuccess(evaluate("+5"), BigRat.fromIntegers(5, 1));
		assertSuccess(evaluate("-5--5"), BigRat.fromIntegers(0, 1));
		assertSuccess(evaluate("+5+-13"), BigRat.fromIntegers(-8, 1));
		assertSuccess(evaluate(" -    3* 5"), BigRat.fromIntegers(-15, 1));
	});

	it("parens", () => {
		assertSuccess(evaluate("(1+1)"), BigRat.fromIntegers(2, 1));
		assertSuccess(evaluate("    (   1  +1     )   "), BigRat.fromIntegers(2, 1));
		assertSuccess(evaluate("4 + (5 * 3)"), BigRat.fromIntegers(19, 1));
		assertSuccess(evaluate("(4 + 5) * 3"), BigRat.fromIntegers(27, 1));
		assertSuccess(evaluate("121 * -(3 + 5)"), BigRat.fromIntegers(968, -1));

		assertFailure(evaluate(")"), 0);
		assertFailure(evaluate("(  "), 3);
		assertFailure(evaluate("( )"), 2);
	});
});
