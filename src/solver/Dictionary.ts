import { BigRat } from "../math/BigRat";

/*
Course notes and general information:  https://www.matem.unam.mx/~omar/math340

Interactive online solver (this is great): https://sagecell.sagemath.org/
	# http://sporadic.stanford.edu/reference/numerical/sage/numerical/interactive_simplex_method.html#
	%display typeset
	A = ([30,0,0,0,0],[0,0,0,30,-60],[-40,0,50,0,0],[-20,40,0,0,0],[0,-20,0,-60,30],[0,0,-100,30,30])
	b = (11700, -600, 0, 0, 0, 0)
	c = (-1000/39, 0, 0, 0, 0)
	P = InteractiveLPProblem(A, b, c, ["x1", "x2", "x3", "x4", "x5"], variable_type=">=")
	P = P.standard_form()
	D = P.initial_dictionary()
	D
	P.run_simplex_method()

Incorrectly marks problems as infeasible: https://docs.rs/slp/latest/slp/

Good 2d geometric visualizer, use in a Google collab py notebook: https://gilp.henryrobbins.com/en/latest/modules.html

Best JS solver:  https://www.npmjs.com/package/javascript-lp-solver
	const solver = require('javascript-lp-solver');
	solver.Solve({
		optimize: "value",
		opType: "min",
		constraints: {
			copper: { max: 2000 },
			iron: { max: 4000 },
			ingots: { max: -200 },
		},
		variables: {
			recipe1: {
			copper: 30,
			iron: 0,
			ingots: -30,
			value: 6000,
			},
			recipe2: {
			copper: 50,
			iron: 25,
			ingots: -100,
			value: 12500,
			},
		},
	});

Interactive tableau display, bit of a pain:  http://www.phpsimplex.com/simplex/simplex.htm?l=en
*/

/** Map from x indices to y indices */
function makeMapping<T>(x: T[], y: T[]) {
	const ym = new Map<T, number>();
	for (let yi = 0; yi < y.length; yi++) {
		ym.set(y[yi], yi);
	}
	const ret = Array<number>(x.length);
	for (let xi = 0; xi < x.length; xi++) {
		const yi = ym.get(x[xi]);
		if (yi == null) {
			return null;
		}
		ret[xi] = yi;
	}
	return ret;
}

export class Dictionary {
	/** names of the exiting variables, top to bottom. */
	basic: number[];
	/** names of the entering variables, left to right. */
	nonBasic: number[];
	/** If true, there is a second objective row below the first one. */
	isDualObjective: boolean;
	/** All coefficients, left to right then top to bottom.  The last column contains constants, and the last rows are objective rows. */
	coefficients: BigRat[];

	private nCols: number;
	private nRows: number;
	private objectiveStartIndex: number;

	/**
	 * Create a new Dictionary.  All passed parameters will be owned by the dictionary.
	 */
	constructor(basic: number[], nonBasic: number[], isDualObjective: boolean, coefficients?: BigRat[]) {
		this.basic = basic;
		this.nonBasic = nonBasic;
		this.isDualObjective = isDualObjective;
		this.nCols = this.nonBasic.length + 1;
		this.nRows = this.basic.length + (isDualObjective ? 2 : 1);
		this.objectiveStartIndex = this.nCols * this.basic.length;
		this.coefficients = coefficients ?? Array<BigRat>(this.nCols * this.nRows).fill(BigRat.ZERO);
	}

	clone() {
		return new Dictionary(
			this.basic.slice(),
			this.nonBasic.slice(),
			this.isDualObjective,
			this.coefficients.slice()
		);
	}

	stringify() {
		// Match a stringification convention where the constant terms are first, not last
		// TODO: Since this is only used for internal tests, if we fix all of them we could remove this swizzling
		let ret = `${this.basic.join()};${this.nonBasic.join()};`;
		let first = true;
		for (let j = 0; j < this.nRows; j++) {
			for (let i = 0; i < this.nCols; i++) {
				const fixi = (i + this.nCols - 1) % this.nCols;
				if (first) {
					first = false;
				} else {
					ret += ",";
				}
				ret += this.coefficients[j * this.nCols + fixi].toRatioString();
			}
		}
		return ret;
	}

	static parse(s: string) {
		const parts = s.split(";");
		if (parts.length !== 3) {
			return null;
		}
		function parsePart<T>(t: string, validator: RegExp, project: (v: string) => T): T[] | null {
			const tt = t.split(",");
			const res: T[] = [];
			for (const v of tt) {
				if (!v.match(validator)) {
					return null;
				}
				res.push(project(v));
			}
			return res;
		}

		const basic = parsePart(parts[0], /^\d+$/, (v) => parseInt(v, 10));
		const nonBasic = parsePart(parts[1], /^\d+$/, (v) => parseInt(v, 10));
		const coefficients = parsePart(parts[2], /^-?\d+(:-?\d+)?$/, (v) => {
			const split = v.split(":");
			return new BigRat(BigInt(split[0]), BigInt(split[1] ?? "1"));
		});
		if (!basic || !nonBasic || !coefficients) {
			return null;
		}
		let nRows = basic.length + 1;
		const nCols = nonBasic.length + 1;
		let isDualObjective = false;
		if (nRows * nCols !== coefficients.length) {
			nRows += 1;
			isDualObjective = true;
			if (nRows * nCols !== coefficients.length) {
				return null;
			}
		}
		// flip the coefficients to match the change made in stringify above
		for (let j = 0; j < nRows; j++) {
			const [constantTerm] = coefficients.splice(j * nCols, 1);
			coefficients.splice((j + 1) * nCols - 1, 0, constantTerm);
		}

		return new Dictionary(basic, nonBasic, isDualObjective, coefficients);
	}

	static equal(x: Dictionary | null, y: Dictionary | null) {
		if (!x || !y) {
			return x == y;
		}
		if (
			x.basic.length !== y.basic.length ||
			x.nonBasic.length !== y.nonBasic.length ||
			x.isDualObjective !== y.isDualObjective ||
			x.coefficients.length !== y.coefficients.length
		) {
			return false;
		}
		const basicMap = makeMapping(x.basic, y.basic);
		if (!basicMap) {
			return false;
		}
		const nonBasicMap = makeMapping(x.nonBasic, y.nonBasic);
		if (!nonBasicMap) {
			return false;
		}
		const pitch = x.nCols;
		const nRows = x.nRows;
		for (let j = 0; j < nRows; j++) {
			for (let i = 0; i < pitch; i++) {
				const yi = i === pitch - 1 ? i : nonBasicMap[i];
				const yj = j >= x.basic.length ? j : basicMap[j];

				const xv = x.coefficients[j * pitch + i];
				const yv = y.coefficients[yj * pitch + yi];
				if (xv.neq(yv)) {
					return false;
				}
			}
		}
		return true;
	}

	needsTwoPhase() {
		const pitch = this.nCols;
		const max = pitch * this.basic.length;
		const { objectiveStartIndex, coefficients } = this;
		for (let a = pitch - 1; a < objectiveStartIndex; a += pitch) {
			if (coefficients[a].sign() < 0) {
				return true;
			}
		}
		return false;
	}

	/** Make a special dictionary out of a normal one that needs it (negative constraints). */
	makeSpecial() {
		const pitch = this.nCols;
		const oldNRows = this.nRows;
		const newNRows = oldNRows - (this.isDualObjective ? 1 : 0);
		const { basic, nonBasic, coefficients } = this;
		const newBasic = basic.slice();
		const newNonBasic = nonBasic.slice();
		newNonBasic.push(0);
		const newPitch = pitch + 1;
		const newMax = newPitch * newNRows;

		const newCoefficients = Array<BigRat>(newMax);

		let aFrom = 0;
		let aTo = 0;
		for (let j = 0; j < newNRows - 1; j++) {
			for (let i = 0; i < pitch; i++) {
				newCoefficients[aTo++] = coefficients[aFrom++];
				if (i === pitch - 2) {
					newCoefficients[aTo++] = BigRat.ONE;
				}
			}
		}
		for (let i = 0; i < pitch; i++) {
			newCoefficients[aTo++] = BigRat.ZERO;
			if (i === pitch - 2) {
				newCoefficients[aTo++] = BigRat.MINUS_ONE;
			}
		}

		return new Dictionary(newBasic, newNonBasic, false, newCoefficients);
	}

	/** Slice off the x0 to turn a solved special dictionary back into a regular one. */
	makeRegular(original: Dictionary) {
		const oldPitch = this.nCols;
		const oldNRows = this.nRows;
		const newNRows = original.nRows;
		const { basic, nonBasic, coefficients } = this;
		const newPitch = oldPitch - 1;
		const oldMax = oldNRows * oldPitch;
		const newMax = newNRows * newPitch;

		const newBasic = basic.slice();
		const newNonBasic = nonBasic.slice();
		const dropCol = newNonBasic.indexOf(0);
		if (dropCol < 0) {
			throw new Error("Internal error: makeRegular");
		}
		newNonBasic.splice(dropCol, 1);

		const newCoefficients = Array<BigRat>(newMax);

		let aTo = 0;
		{
			const stop = newPitch * original.basic.length;
			for (let aFrom = 0, r = 0; aTo < stop; aFrom++, r++) {
				if (r === oldPitch) {
					r = 0;
				}
				if (r !== dropCol) {
					newCoefficients[aTo++] = coefficients[aFrom];
				}
			}
		}

		const oldCoefficients = original.coefficients;
		// Old objective function is in oldCoefficients[oStart..oStart + newPitch - 1]
		// If present, second objective function is in oldCoefficients[oStart + newPitch..oStart + newPitch * 2 - 1]
		// Assume that the nonBasics were 1, 2, ..., pitch in order

		// iterate through objective rows
		for (let oStart = aTo; oStart < newMax; oStart += newPitch) {
			const oEnd = oStart + newPitch;
			for (let i = oStart; i < oEnd; i++) {
				newCoefficients[i] = BigRat.ZERO;
			}
			for (let i = oStart, name = 1; i < oEnd; i++, name++) {
				const nonBasicIndex = name < newPitch ? newNonBasic.indexOf(name) : name - 1;
				const oldCoeff = oldCoefficients[i];
				if (nonBasicIndex >= 0) {
					const toIndex = oStart + nonBasicIndex;
					newCoefficients[toIndex] = newCoefficients[toIndex].add(oldCoeff);
					continue;
				}

				const basicStart = newBasic.indexOf(name) * newPitch;
				const basicEnd = basicStart + newPitch;
				for (let jFrom = basicStart, jTo = oStart; jFrom < basicEnd; jFrom++, jTo++) {
					newCoefficients[jTo] = newCoefficients[jTo].add(oldCoeff.mul(newCoefficients[jFrom]));
				}
			}
		}

		return new Dictionary(newBasic, newNonBasic, original.isDualObjective, newCoefficients);
	}

	/** Pivot this dictonary in place. */
	pivotMutate(special: boolean): boolean {
		const pitch = this.nCols;
		const rowCount = this.nRows;
		const coord = (i: number, j: number) => i + j * pitch;
		const max = pitch * rowCount;
		const { basic, nonBasic, isDualObjective, objectiveStartIndex, coefficients } = this;

		let enterCol = -1;
		let enterName = -1;
		if (!special) {
			if (!isDualObjective) {
				let enterCoeff: BigRat | undefined;
				for (let a = objectiveStartIndex, idx = 0; a < max - 1; a++, idx++) {
					const coeff = coefficients[a];
					if (coeff.sign() <= 0) {
						continue;
					}
					const varName = nonBasic[idx];
					const cmp = enterCoeff && BigRat.compare(enterCoeff, coeff);

					if (cmp == null || cmp === -1 || (cmp === 0 && varName > enterName)) {
						enterCol = idx;
						enterName = varName;
						enterCoeff = coeff;
					}
				}
				if (!enterCoeff) {
					return false;
				}
			} else {
				let primaryEnterCoeff: BigRat | undefined;
				let secondaryEnterCoeff: BigRat | undefined;
				for (
					let a = objectiveStartIndex, b = objectiveStartIndex + pitch, idx = 0;
					b < max - 1;
					a++, b++, idx++
				) {
					const primaryCoeff = coefficients[a];
					const secondaryCoeff = coefficients[b];
					const primarySign = primaryCoeff.sign();
					const secondarySign = secondaryCoeff.sign();
					if (primarySign < 0 || (primarySign === 0 && secondarySign <= 0)) {
						continue;
					}
					const varName = nonBasic[idx];
					const cmpPrim = primaryEnterCoeff && BigRat.compare(primaryEnterCoeff, primaryCoeff);
					const cmpSec = secondaryEnterCoeff && BigRat.compare(secondaryEnterCoeff, secondaryCoeff);

					if (
						cmpPrim == null ||
						cmpSec == null ||
						cmpPrim === -1 ||
						(cmpPrim === 0 && cmpSec === -1) ||
						(cmpPrim === 0 && cmpSec === 0 && varName > enterName)
					) {
						enterCol = idx;
						enterName = varName;
						primaryEnterCoeff = primaryCoeff;
						secondaryEnterCoeff = secondaryCoeff;
					}
				}
				if (!primaryEnterCoeff) {
					return false;
				}
			}
		} else {
			enterCol = pitch - 2;
			enterName = 0;
		}

		let exitRow = -1;
		let exitName = -1;
		if (!special) {
			let exitCoeff: BigRat | undefined;
			for (
				let a = coord(enterCol, 0), b = pitch - 1, idx = 0;
				a < objectiveStartIndex;
				a += pitch, b += pitch, idx++
			) {
				const den = coefficients[a];
				if (den.sign() >= 0) {
					continue;
				}
				const coeff = coefficients[b].div(den).neg();
				if (coeff.sign() < 0) {
					throw new Error("Internal error: exit pivot");
				}
				const varName = basic[idx];
				const cmp = exitCoeff && BigRat.compare(exitCoeff, coeff);
				if (cmp == null || cmp === 1 || (cmp === 0 && varName < exitName)) {
					exitRow = idx;
					exitName = varName;
					exitCoeff = coeff;
				}
			}
			if (!exitCoeff) {
				return false;
			}
		} else {
			let exitCoeff: BigRat | undefined;
			for (let a = pitch - 1, idx = 0; a < objectiveStartIndex; a += pitch, idx++) {
				const coeff = coefficients[a];
				const varName = basic[idx];
				if (coeff.sign() > 0) {
					continue;
				}
				const cmp = exitCoeff && BigRat.compare(exitCoeff, coeff);
				if (cmp == null || cmp === 1 || (cmp === 0 && varName < exitName)) {
					exitRow = idx;
					exitName = varName;
					exitCoeff = coeff;
				}
			}
			if (!exitCoeff) {
				return false;
			}
		}

		this.basic[exitRow] = enterName;
		this.nonBasic[enterCol] = exitName;

		const exitRowStart = exitRow * pitch;
		const exitRowEnd = exitRowStart + pitch;

		{
			const pivotIndex = exitRowStart + enterCol;
			const factor = BigRat.MINUS_ONE.div(coefficients[pivotIndex]);
			coefficients[pivotIndex] = BigRat.MINUS_ONE;
			for (let a = exitRowStart; a < exitRowEnd; a++) {
				coefficients[a] = coefficients[a].mul(factor);
			}
		}

		for (let destRowStart = 0, destRowEnd = pitch; destRowStart < max; destRowStart += pitch, destRowEnd += pitch) {
			if (destRowStart === exitRowStart) {
				continue;
			}

			let r: BigRat;
			{
				const pivotIndex = destRowStart + enterCol;
				r = coefficients[pivotIndex];
				coefficients[pivotIndex] = BigRat.ZERO;
			}

			for (let aTo = destRowStart, aFrom = exitRowStart; aTo < destRowEnd; aTo++, aFrom++) {
				coefficients[aTo] = coefficients[aTo].fma(r, coefficients[aFrom]);
			}
		}

		return true;
	}
}

/**
 * Solves an LP, returning the dictionary or `null` if infeasible.
 * May or may not mutate the input dictionary, even if it returns `null`.
 * May or may not return the same dictionary as passed.  If it does, it will be mutated with the solution.
 */
export function solveStandardFormMutate(dict: Dictionary) {
	if (dict.needsTwoPhase()) {
		let phase1 = dict.makeSpecial();
		if (!phase1.pivotMutate(true)) {
			return null;
		}
		for (let loop = 0; ; loop++) {
			if (loop === 200) {
				console.error("Possible cycle detected");
				return null;
			}
			if (!phase1.pivotMutate(false)) {
				break;
			}
		}
		if (phase1.coefficients[phase1.coefficients.length - 1].sign() < 0) {
			return null;
		}
		// TODO: Could/should makeRegular be a mutation to save?
		dict = phase1.makeRegular(dict);
	}
	for (let loop = 0; ; loop++) {
		if (loop === 200) {
			console.error("Possible cycle detected");
			return null;
		}
		if (!dict.pivotMutate(false)) {
			break;
		}
	}
	return dict;
}

// Basic junk display widget for a Dictionary
/*
function MatrixDisplay() {
	const [s, cs] = useState("");
	let otherDom = null;
	try {
		const [rows, cols, coeffs] = s.split(";").map((z) => z.split(","));
		const nodes = [];
		const idx = (i, j, v) => (nodes[j * (cols.length + 2) + i] = <div>{v}</div>);

		for (let j = 0; j < rows.length; j++) {
			idx(0, j, <strong>x{rows[j]}</strong>);
		}
		idx(0, rows.length, "z1=");
		if (coeffs.length > (cols.length + 1) * (rows.length + 1)) {
			idx(0, rows.length + 1, "z2=");
		}
		let c = 0;
		for (let j = 0; c < coeffs.length; j++) {
			for (let i = 1; i <= cols.length + 1; i++) {
				let name = i > 1 ? <b> x{cols[i - 2]}</b> : null;
				idx(
					i,
					j,
					<React.Fragment>
						{coeffs[c++]}
						{name}
					</React.Fragment>
				);
			}
		}
		otherDom = (
			<div style={{ display: "grid", gridTemplate: `1fr / ${"1fr ".repeat(cols.length + 2)}` }}>{nodes}</div>
		);
	} catch (e) {
		otherDom = e && e.message;
	}
	return (
		<div>
			<input type="text" value={s} onChange={(ev) => cs(ev.currentTarget.value)} />
			<div>{otherDom}</div>
		</div>
	);
}
*/
