import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Dictionary, solveStandardFormMutate } from "./Dictionary";

describe("dictionary", () => {
	it("parse", () => {
		const d = Dictionary.parse("4,5,6;1,2,3;14,-2,-1,-1,28,-4,-2,-3,30,-2,-5,-5,0,1,2,-1");
		assert(d);
		assert.equal(d.basic.join(), "4,5,6");
		assert.equal(d.nonBasic.join(), "1,2,3");
		// Flip coefficient order so that the constant term is last
		assert.equal(
			d.coefficients.map((c) => c.toRatioString()).join(),
			"-2:1,-1:1,-1:1,14:1,-4:1,-2:1,-3:1,28:1,-2:1,-5:1,-5:1,30:1,1:1,2:1,-1:1,0:1",
		);
	});

	it("stringify", () => {
		const d = Dictionary.parse("4,5,6;1,2,3;14,-2,-1,-1,28,-4,-2,-3,30,-2,-5,-5,0,1,2,-1");
		assert(d);
		const s = d.stringify();
		assert.equal(s, "4,5,6;1,2,3;14:1,-2:1,-1:1,-1:1,28:1,-4:1,-2:1,-3:1,30:1,-2:1,-5:1,-5:1,0:1,1:1,2:1,-1:1");
	});

	it("parse and stringify again", () => {
		const s =
			"2,3,4;1,5,6,0;11:5,3:5,2:5,1:5,-3:5,8:5,-1:5,1:5,3:5,-4:5,3:1,-1:1,0:1,-1:1,2:1,0:1,0:1,0:1,0:1,-1:1";
		const d = Dictionary.parse(s);
		assert(d);
		const t = d.stringify();
		assert.equal(s, t);
	});

	it("equal", () => {
		const d1 = Dictionary.parse(
			"1,2,5;3,4,6;5:1,0:1,-5:8,1:8,4:1,-1:1,1:4,-1:4,0:1,-1:1,2:1,0:1,13:1,-3:1,-1:8,-3:8",
		);
		const d2 = Dictionary.parse(
			"1,2,5;3,6,4;5:1,0:1,1:8,-5:8,4:1,-1:1,-1:4,1:4,0:1,-1:1,0:1,2:1,13:1,-3:1,-3:8,-1:8",
		);
		assert(d1);
		assert(d2);
		assert(Dictionary.equal(d1, d2));
	});

	it("makeSpecial", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = Dictionary.parse("4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,3");
		assert(d);

		const sp = d.makeSpecial();
		assert.equal(
			sp.stringify(),
			"4,5,6;1,2,3,0;4:1,-2:1,1:1,-2:1,1:1,-5:1,-2:1,3:1,-1:1,1:1,-1:1,1:1,-1:1,2:1,1:1,0:1,0:1,0:1,0:1,-1:1",
		);
	});

	it("makeSpecial 2", () => {
		const d = Dictionary.parse("4,5,6;1,2,3;4,-2,1,2,-5,-2,3,1,-1,1,-1,-1,0,1,-1,1");
		assert(d);

		const sp = d.makeSpecial();
		assert.equal(
			sp.stringify(),
			"4,5,6;1,2,3,0;4:1,-2:1,1:1,2:1,1:1,-5:1,-2:1,3:1,1:1,1:1,-1:1,1:1,-1:1,-1:1,1:1,0:1,0:1,0:1,0:1,-1:1",
		);
	});

	it("makeRegular", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		// Same value from the end of pivot test 2 but in the order in the example
		const d = Dictionary.parse(
			"2,3,4;1,5,6,0;11:5,3:5,2:5,1:5,-3:5,8:5,-1:5,1:5,3:5,-4:5,3:1,-1:1,0:1,-1:1,2:1,0:1,0:1,0:1,0:1,-1:1",
		);
		assert(d);

		// According to the website, o is "4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,3", but that appears to be an error.
		const o = Dictionary.parse("4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,1");
		assert(o);

		const r = d.makeRegular(o);
		assert.equal(
			r.stringify(),
			"2,3,4;1,5,6;11:5,3:5,2:5,1:5,8:5,-1:5,1:5,3:5,3:1,-1:1,0:1,-1:1,-3:5,1:5,-1:5,2:5",
		);
	});

	it("pivot test 1", () => {
		// https://www.matem.unam.mx/~omar/math340/simplex-intro.html
		const d = Dictionary.parse("4,5,6;1,2,3;14,-2,-1,-1,28,-4,-2,-3,30,-2,-5,-5,0,1,2,-1");
		assert(d);
		assert.equal(
			d.stringify(),
			"4,5,6;1,2,3;14:1,-2:1,-1:1,-1:1,28:1,-4:1,-2:1,-3:1,30:1,-2:1,-5:1,-5:1,0:1,1:1,2:1,-1:1",
		);

		assert(d.pivotMutate(false));
		const expectedP1 = Dictionary.parse(
			"2,4,5;1,3,6;6:1,-2:5,-1:1,-1:5,8:1,-8:5,0:1,1:5,16:1,-16:5,-1:1,2:5,12:1,1:5,-3:1,-2:5",
		);
		assert(Dictionary.equal(d, expectedP1));

		assert(d.pivotMutate(false));
		// Omar's solution here is:
		// "1,2,5;3,4,6;5:1,0:1,-5:8,1:8,4:1,-1:1,1:4,-1:4,0:1,-1:1,2:1,0:1,13:1,-3:1,-1:8,-3:8"
		// But it's a just an ordering difference -- he's kept the 3,4,6 in ascending order where there's no particular need to.
		const expectedP2 = Dictionary.parse(
			"1,2,5;3,6,4;5:1,0:1,1:8,-5:8,4:1,-1:1,-1:4,1:4,0:1,-1:1,0:1,2:1,13:1,-3:1,-3:8,-1:8",
		);
		assert(Dictionary.equal(d, expectedP2));

		assert(!d.pivotMutate(false));
	});

	it("pivot test 2", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = Dictionary.parse("4,5,6;1,2,3,0;4,-2,1,-2,1,-5,-2,3,-1,1,-1,1,-1,2,1,0,0,0,0,-1");
		assert(d);

		assert(d.pivotMutate(true));
		const expectedP1 = Dictionary.parse(
			"0,4,6;1,2,3,5;5:1,2:1,-3:1,1:1,1:1,9:1,0:1,-2:1,-1:1,1:1,4:1,3:1,-4:1,3:1,1:1,-5:1,-2:1,3:1,-1:1,-1:1",
		);
		assert(Dictionary.equal(d, expectedP1));

		assert(d.pivotMutate(false));
		const expectedP2 = Dictionary.parse(
			"2,0,4;1,3,5,6;1:1,3:4,3:4,1:4,-1:4,2:1,-1:4,-5:4,1:4,3:4,7:1,-3:2,-5:2,1:2,1:2,-2:1,1:4,5:4,-1:4,-3:4",
		);
		assert(Dictionary.equal(d, expectedP2));

		assert(d.pivotMutate(false));
		const expectedP3 = Dictionary.parse(
			"3,2,4;1,5,6,0;8:5,-1:5,1:5,3:5,-4:5,11:5,3:5,2:5,1:5,-3:5,3:1,-1:1,0:1,-1:1,2:1,0:1,0:1,0:1,0:1,-1:1",
		);
		// As before, our order is different
		assert(Dictionary.equal(d, expectedP3));
	});

	it("degenerate pivot basic", () => {
		// https://www.matem.unam.mx/~omar/math340/degenerate.html
		const d = Dictionary.parse("1,4,6;2,3,5;1,-1,0,-1,2,2,-1,2,0,1,-1,1,2,0,1,-2");
		assert(d);
		assert(
			Dictionary.equal(
				d,
				Dictionary.parse("1,4,6;2,3,5;1:1,-1:1,0:1,-1:1,2:1,2:1,-1:1,2:1,0:1,1:1,-1:1,1:1,2:1,0:1,1:1,-2:1"),
			),
		);

		assert(d.pivotMutate(false));
		assert(
			Dictionary.equal(
				d,
				Dictionary.parse("3,1,4;2,5,6;0:1,1:1,1:1,-1:1,1:1,-1:1,-1:1,0:1,2:1,1:1,1:1,1:1,2:1,1:1,-1:1,-1:1"),
			),
		);
	});

	it("solveStandardForm 1", () => {
		// https://www.matem.unam.mx/~omar/math340/simplex-intro.html
		const d = Dictionary.parse("4,5,6;1,2,3;14,-2,-1,-1,28,-4,-2,-3,30,-2,-5,-5,0,1,2,-1");
		assert(d);

		const solved = solveStandardFormMutate(d);
		assert(solved);
		assert(
			Dictionary.equal(
				solved,
				Dictionary.parse("1,2,5;3,6,4;5:1,0:1,1:8,-5:8,4:1,-1:1,-1:4,1:4,0:1,-1:1,0:1,2:1,13:1,-3:1,-3:8,-1:8"),
			),
		);
	});

	it("solveStandardForm 2", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = Dictionary.parse("4,5,6;1,2,3;4,-2,1,-2,-5,-2,3,-1,-1,1,-1,2,0,1,-1,1");
		assert(d);

		const solved = solveStandardFormMutate(d);
		assert(solved);
		assert(
			Dictionary.equal(
				solved,
				Dictionary.parse(
					"6,3,2;1,5,4;3:1,-1:1,0:1,-1:1,17:5,-4:5,1:5,-3:5,14:5,2:5,2:5,-1:5,3:5,-1:5,-1:5,-2:5",
				),
			),
		);
	});

	it("solveStandardForm 3", () => {
		// https://www.matem.unam.mx/~omar/math340/2-phase.html
		const d = Dictionary.parse("4,5,6;1,2,3;4,-2,1,2,-5,-2,3,1,-1,1,-1,-1,0,1,-1,1");
		assert(d);

		const solved = solveStandardFormMutate(d);
		assert(!solved);
	});

	it("degenerate pivot", () => {
		// https://www.matem.unam.mx/~omar/math340/degenerate.html
		const d = Dictionary.parse("4,5,6;1,2,3;4,-2,0,-1,1,-1,-1,0,1,-1,0,-1,0,2,2,1");
		assert(d);
		assert.equal(
			d.stringify(),
			"4,5,6;1,2,3;4:1,-2:1,0:1,-1:1,1:1,-1:1,-1:1,0:1,1:1,-1:1,0:1,-1:1,0:1,2:1,2:1,1:1",
		);

		const solved = solveStandardFormMutate(d);
		assert(solved);
		assert(
			Dictionary.equal(
				solved,
				Dictionary.parse("3,2,4;1,5,6;1:1,-1:1,0:1,-1:1,1:1,-1:1,-1:1,0:1,3:1,-1:1,0:1,1:1,3:1,-1:1,-2:1,-1:1"),
			),
		);
	});

	it("making plastic and stuff", () => {
		/*
		{
			constraints: new Map([
				[
					Items.find((i) => i.ClassName === "Desc_LiquidOil_C")!,
					{ constraint: "limited", rate: BigRat.fromInteger(11700) },
				],
				[Items.find((i) => i.ClassName === "Desc_Water_C")!, { constraint: "plentiful", rate: BigRat.ZERO }],
				[
					Items.find((i) => i.ClassName === "Desc_Plastic_C")!,
					{ constraint: "produced", rate: BigRat.fromIntegers(600, 1) },
				],
			]),
			availableRecipes: new Set([
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_HeavyOilResidue_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_ResidualRubber_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_DilutedFuel_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_RecycledRubber_C")!,
				Recipes.find((r) => r.ClassName === "Recipe_Alternate_Plastic_1_C")!,
			]),
		}
		*/
		const d = [
			"6,7,8,9,10,11;1,2,3,4,5;11700:1,-30:1,0:1,0:1,0:1,0:1,-600:1,0:1,0:1,0:1,-30:1,60:1,0:1,40:1,0:1,-50:1,0:1,0:1,0:1,20:1,-40:1,0:1,0:1,0:1,0:1,0:1,20:1,0:1,60:1,-30:1,0:1,0:1,0:1,100:1,-30:1,-30:1,0:1,-1000:39,0:1,0:1,0:1,0:1",
			"6,7,8,9,10,11;1,2,3,4,5,0;11700:1,-30:1,0:1,0:1,0:1,0:1,1:1,-600:1,0:1,0:1,0:1,-30:1,60:1,1:1,0:1,40:1,0:1,-50:1,0:1,0:1,1:1,0:1,20:1,-40:1,0:1,0:1,0:1,1:1,0:1,0:1,20:1,0:1,60:1,-30:1,1:1,0:1,0:1,0:1,100:1,-30:1,-30:1,1:1,0:1,0:1,0:1,0:1,0:1,0:1,-1:1",
			"0,6,8,9,10,11;1,2,3,4,5,7;600:1,0:1,0:1,0:1,30:1,-60:1,1:1,12300:1,-30:1,0:1,0:1,30:1,-60:1,1:1,600:1,40:1,0:1,-50:1,30:1,-60:1,1:1,600:1,20:1,-40:1,0:1,30:1,-60:1,1:1,600:1,0:1,20:1,0:1,90:1,-90:1,1:1,600:1,0:1,0:1,100:1,0:1,-90:1,1:1,-600:1,0:1,0:1,0:1,-30:1,60:1,-1:1",
			"5,0,6,8,9,11;1,2,3,4,7,10;20:3,0:1,2:9,0:1,1:1,1:90,-1:90,200:1,0:1,-40:3,0:1,-30:1,1:3,2:3,11900:1,-30:1,-40:3,0:1,-30:1,1:3,2:3,200:1,40:1,-40:3,-50:1,-30:1,1:3,2:3,200:1,20:1,-160:3,0:1,-30:1,1:3,2:3,0:1,0:1,-20:1,100:1,-90:1,0:1,1:1,-200:1,0:1,40:3,0:1,30:1,-1:3,-2:3",
			"4,5,0,6,8,9;1,2,3,7,10,11;0:1,0:1,-2:9,10:9,0:1,1:90,-1:90,20:3,0:1,0:1,10:9,1:90,0:1,-1:90,200:1,0:1,-20:3,-100:3,1:3,1:3,1:3,11900:1,-30:1,-20:3,-100:3,1:3,1:3,1:3,200:1,40:1,-20:3,-250:3,1:3,1:3,1:3,200:1,20:1,-140:3,-100:3,1:3,1:3,1:3,-200:1,0:1,20:3,100:3,-1:3,-1:3,-1:3",
			"3,4,5,0,6,9;1,2,7,10,11,8;12:5,12:25,-2:25,1:250,1:250,1:250,-3:250,8:3,8:15,-14:45,1:225,7:450,-1:150,-1:75,28:3,8:15,-4:45,7:450,1:225,-1:150,-1:75,120:1,-16:1,-4:1,1:5,1:5,1:5,2:5,11820:1,-46:1,-4:1,1:5,1:5,1:5,2:5,120:1,4:1,-44:1,1:5,1:5,1:5,2:5,-120:1,16:1,4:1,-1:5,-1:5,-1:5,-2:5",
			"1,3,4,5,6,9;2,7,10,11,8,0;15:2,-1:4,1:80,1:80,1:80,1:40,-1:16,6:1,-1:5,1:100,1:100,1:100,0:1,-3:100,20:3,-4:9,1:90,1:45,0:1,0:1,-1:30,40:3,-2:9,1:45,1:90,0:1,0:1,-1:30,11475:1,15:2,-3:8,-3:8,-3:8,-3:4,23:8,150:1,-45:1,1:4,1:4,1:4,1:2,-1:4,0:1,0:1,0:1,0:1,0:1,0:1,-1:1",
			"1,3,4,5,6,9;2,7,10,11,8;15:2,-1:4,1:80,1:80,1:80,1:40,6:1,-1:5,1:100,1:100,1:100,0:1,20:3,-4:9,1:90,1:45,0:1,0:1,40:3,-2:9,1:45,1:90,0:1,0:1,11475:1,15:2,-3:8,-3:8,-3:8,-3:4,150:1,-45:1,1:4,1:4,1:4,1:2,-2500:13,250:39,-25:78,-25:78,-25:78,-25:39",
			"2,1,3,4,5,6;7,10,11,8,9;10:3,1:180,1:180,1:180,1:90,-1:45,20:3,1:90,1:90,1:90,1:45,1:180,16:3,2:225,2:225,2:225,-1:450,1:225,140:27,7:810,8:405,-1:405,-2:405,4:405,340:27,17:810,4:405,-1:810,-1:405,2:405,11500:1,-1:3,-1:3,-1:3,-2:3,-1:6,-20000:117,-100:351,-100:351,-100:351,-200:351,-50:351",
		].map((s) => Dictionary.parse(s)!);
		for (const dict of d) {
			assert(dict);
		}
		assert(Dictionary.equal(d[1], d[0].makeSpecial()));

		assert(d[1].pivotMutate(true));
		assert(Dictionary.equal(d[2], d[1]));
		assert(d[2].pivotMutate(false));
		assert(Dictionary.equal(d[3], d[2]));
		assert(d[3].pivotMutate(false));
		assert(Dictionary.equal(d[4], d[3]));
		assert(d[4].pivotMutate(false));
		assert(Dictionary.equal(d[5], d[4]));
		assert(d[5].pivotMutate(false));
		assert(Dictionary.equal(d[6], d[5]));

		assert(!d[6].pivotMutate(false));

		assert(Dictionary.equal(d[7], d[6].makeRegular(d[0])));

		assert(d[7].pivotMutate(false));
		assert(Dictionary.equal(d[8], d[7]));

		assert(!d[8].pivotMutate(false));
	});
});
