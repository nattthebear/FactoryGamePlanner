import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Dictionary, makeRegular, makeSpecial, parse, pivot, stringify } from "./Dictionary";

describe("Dictionary", () => {
	it("pivot test 1", () => {
		// https://www.matem.unam.mx/~omar/math340/simplex-intro.html
		const d = parse("4,5,6;1,2,3;14,-2,-1,-1,28,-4,-2,-3,30,-2,-5,-5,0,1,2,-1");
		assert(d);
		assert.equal(
			stringify(d),
			"4,5,6;1,2,3;14:1,-2:1,-1:1,-1:1,28:1,-4:1,-2:1,-3:1,30:1,-2:1,-5:1,-5:1,0:1,1:1,2:1,-1:1"
		);

		const p1 = pivot(d, false);
		assert(p1);
		assert.equal(
			stringify(p1),
			"2,4,5;1,3,6;6:1,-2:5,-1:1,-1:5,8:1,-8:5,0:1,1:5,16:1,-16:5,-1:1,2:5,12:1,1:5,-3:1,-2:5"
		);

		const p2 = pivot(p1, false);
		assert(p2);
		// Omar's solution here is:
		// "1,2,5;3,4,6;5:1,0:1,-5:8,1:8,4:1,-1:1,1:4,-1:4,0:1,-1:1,2:1,0:1,13:1,-3:1,-1:8,-3:8"
		// But it's a just an ordering difference -- he's kept the 3,4,6 in ascending order where there's no particular need to.
		assert.equal(
			stringify(p2),
			"1,2,5;3,6,4;5:1,0:1,1:8,-5:8,4:1,-1:1,-1:4,1:4,0:1,-1:1,0:1,2:1,13:1,-3:1,-3:8,-1:8"
		);

		const p3 = pivot(p2, false);
		assert(!p3);
	});

	it("pivot test 2", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = parse("4,5,6;1,2,3,0;4,-2,1,-2,1,-5,-2,3,-1,1,-1,1,-1,2,1,0,0,0,0,-1");
		assert(d);

		const p1 = pivot(d, true);
		assert(p1);
		assert.equal(
			stringify(p1),
			"0,4,6;1,2,3,5;5:1,2:1,-3:1,1:1,1:1,9:1,0:1,-2:1,-1:1,1:1,4:1,3:1,-4:1,3:1,1:1,-5:1,-2:1,3:1,-1:1,-1:1"
		);

		const p2 = pivot(p1, false);
		assert(p2);
		assert.equal(
			stringify(p2),
			"2,0,4;1,3,5,6;1:1,3:4,3:4,1:4,-1:4,2:1,-1:4,-5:4,1:4,3:4,7:1,-3:2,-5:2,1:2,1:2,-2:1,1:4,5:4,-1:4,-3:4"
		);

		const p3 = pivot(p2, false);
		assert(p3);
		// As before, our order is different
		assert.equal(
			stringify(p3),
			"3,2,4;1,5,6,0;8:5,-1:5,1:5,3:5,-4:5,11:5,3:5,2:5,1:5,-3:5,3:1,-1:1,0:1,-1:1,2:1,0:1,0:1,0:1,0:1,-1:1"
		);
	});

	it("makeSpecial", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = parse("4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,3");
		assert(d);

		const sp = makeSpecial(d);
		assert.equal(
			stringify(sp),
			"4,5,6;1,2,3,0;4:1,-2:1,1:1,-2:1,1:1,-5:1,-2:1,3:1,-1:1,1:1,-1:1,1:1,-1:1,2:1,1:1,0:1,0:1,0:1,0:1,-1:1"
		);
	});

	it("makeRegular", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		// Same value from the end of pivot test 2 but in the order in the example
		const d = parse(
			"2,3,4;1,5,6,0;11:5,3:5,2:5,1:5,-3:5,8:5,-1:5,1:5,3:5,-4:5,3:1,-1:1,0:1,-1:1,2:1,0:1,0:1,0:1,0:1,-1:1"
		);
		assert(d);

		// According to the website, o is "4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,3", but that appears to be an error.
		const o = parse("4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,1");
		assert(o);

		const r = makeRegular(d, o);
		assert.equal(stringify(r), "2,3,4;1,5,6;11:5,3:5,2:5,1:5,8:5,-1:5,1:5,3:5,3:1,-1:1,0:1,-1:1,-3:5,1:5,-1:5,2:5");
	});
});
