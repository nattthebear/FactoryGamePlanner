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

export interface Dictionary {
	/** names of the exiting variables, top to bottom */
	basic: number[];
	/** names of the entering variables, left to right */
	nonBasic: number[];
	/** All coefficients, left to right then top to bottom */
	coefficients: BigRat[];
}

/** Number of columns */
const cols = (d: Dictionary) => d.nonBasic.length + 1;
/** Number of rows */
const rows = (d: Dictionary) => d.basic.length + 1;

export const stringify = (d: Dictionary) =>
	`${d.basic.join()};${d.nonBasic.join()};${d.coefficients.map((c) => c.toRatioString()).join()}`;

export function parse(s: string): Dictionary | null {
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
	return { basic, nonBasic, coefficients };
}

function needsTwoPhase(dict: Dictionary) {
	const pitch = cols(dict);
	const max = pitch * rows(dict);
	const { coefficients } = dict;
	for (let a = 0; a < max; a += pitch) {
		if (coefficients[a].sign() < 0) {
			return true;
		}
	}
	return false;
}

/** Pivot the dictionary.  If special, a standard special form is assumed. */
export function pivot(dict: Dictionary, special: boolean): Dictionary | null {
	const pitch = cols(dict);
	const rowCount = rows(dict);
	const coord = (i: number, j: number) => i + j * pitch;
	const max = pitch * rowCount;
	const { basic, nonBasic, coefficients } = dict;

	let enterCol = -1;
	let enterName = -1;
	if (!special) {
		let enterCoeff: BigRat | undefined;
		for (let a = coord(1, rowCount - 1), idx = 0; a < max; a++, idx++) {
			const coeff = coefficients[a];
			if (coeff.sign() <= 0) {
				continue;
			}
			const varName = nonBasic[idx];
			const cmp = enterCoeff && BigRat.compare(enterCoeff, coeff);
			// "Standard" rule
			if (cmp == null || cmp === -1 || (cmp === 0 && varName > enterName)) {
				enterCol = idx + 1;
				enterName = varName;
				enterCoeff = coeff;
			}
			// Bland's rule
			// if (cmp == null || varName < enterName) {
			// 	enterCol = idx + 1;
			// 	enterName = varName;
			// 	enterCoeff = coeff;
			// }
			// Take first possible pivot
			// if (cmp == null) {
			// 	enterCol = idx + 1;
			// 	enterName = varName;
			// 	enterCoeff = coeff;
			//	break;
			// }
		}
		if (!enterCoeff) {
			return null;
		}
	} else {
		enterCol = pitch - 1;
		enterName = 0;
	}

	let exitRow = -1;
	let exitName = -1;
	if (!special) {
		let exitCoeff: BigRat | undefined;
		for (let a = coord(enterCol, 0), b = 0, idx = 0; a < max - pitch; a += pitch, b += pitch, idx++) {
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
			return null;
		}
	} else {
		const stop = max - pitch;
		let exitCoeff: BigRat | undefined;
		for (let a = 0, idx = 0; a < stop; a += pitch, idx++) {
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
			return null;
		}
	}

	const newNonBasic = nonBasic.slice();
	newNonBasic.splice(enterCol - 1, 1);
	newNonBasic.push(exitName);

	const newBasic = basic.slice();
	newBasic.splice(exitRow, 1);
	newBasic.unshift(enterName);

	const newCoefficients = Array<BigRat>(max);

	const aExit = exitRow * pitch;
	let aTo = 0;
	{
		let aFrom = aExit;
		const pivotIndex = aFrom + enterCol;
		const rowEnd = aFrom + pitch;
		const pivotValue = coefficients[pivotIndex].neg();
		for (; aTo < pitch; aTo++, aFrom++) {
			if (aFrom === pivotIndex) {
				aFrom++;
			}
			let value = aFrom < rowEnd ? coefficients[aFrom] : BigRat.MINUS_ONE;
			value = value.div(pivotValue);
			newCoefficients[aTo] = value;
		}
	}

	for (let aFrom = 0; aFrom < max; aFrom += pitch) {
		if (aFrom === aExit) {
			continue;
		}
		const pivotIndex = aFrom + enterCol;
		const pivotValue = coefficients[pivotIndex];
		const rowEnd = aFrom + pitch;
		for (let aTop = 0, aRow = aFrom; aTop < pitch; aTop++, aRow++, aTo++) {
			if (aRow === pivotIndex) {
				aRow++;
			}
			const top = newCoefficients[aTop];
			const bottom = aRow < rowEnd ? coefficients[aRow] : BigRat.ZERO;
			newCoefficients[aTo] = top.mul(pivotValue).add(bottom);
		}
	}

	return {
		basic: newBasic,
		nonBasic: newNonBasic,
		coefficients: newCoefficients,
	};
}

/** Make a special dictionary out of a normal one that needs it (negative constraints). */
export function makeSpecial(dict: Dictionary): Dictionary {
	const pitch = cols(dict);
	const { basic, nonBasic, coefficients } = dict;
	const newBasic = basic.slice();
	const newNonBasic = nonBasic.slice();
	newNonBasic.push(0);
	const inStop = basic.length * (nonBasic.length + 1);
	const newMax = (basic.length + 1) * (nonBasic.length + 2);
	const newCoefficients = Array<BigRat>(newMax);
	let aFrom = 0;
	let aTo = 0;
	for (let r = 0; aFrom < inStop; aFrom++, aTo++, r++) {
		newCoefficients[aTo] = coefficients[aFrom];
		if (r === pitch - 1) {
			newCoefficients[++aTo] = BigRat.ONE;
			r = -1;
		}
	}
	for (; aTo < newMax; aTo++) {
		newCoefficients[aTo] = aTo === newMax - 1 ? BigRat.MINUS_ONE : BigRat.ZERO;
	}

	return {
		basic: newBasic,
		nonBasic: newNonBasic,
		coefficients: newCoefficients,
	};
}

/** Slice off the x0 to turn a solved special dictionary back into a regular one. */
export function makeRegular(dict: Dictionary, original: Dictionary): Dictionary {
	const oldPitch = cols(dict);
	const nRows = rows(dict);
	const { basic, nonBasic, coefficients } = dict;
	const newPitch = oldPitch - 1;
	const oldMax = nRows * oldPitch;
	const newMax = nRows * newPitch;

	const newBasic = basic.slice();
	const newNonBasic = nonBasic.slice();
	const dropCol = newNonBasic.indexOf(0) + 1;
	if (dropCol <= 0) {
		throw new Error("Internal error: makeRegular");
	}
	newNonBasic.splice(dropCol - 1, 1);

	const newCoefficients = Array<BigRat>(newMax);

	let aTo = 0;
	{
		const stop = newMax - newPitch;
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
	// Old objective function is in oldCoefficients[oStart..oStart + pitch - 1]
	// Assume that the nonBasics were 1, 2, ..., pitch in order
	const oStart = aTo;
	const oEnd = oStart + newPitch;
	for (let i = oStart; i < oEnd; i++) {
		newCoefficients[i] = BigRat.ZERO;
	}
	for (let i = oStart, name = 0; i < oEnd; i++, name++) {
		const oldCoeff = oldCoefficients[i];
		if (name === 0) {
			newCoefficients[i] = oldCoeff;
			continue;
		}

		const nonBasicIndex = newNonBasic.indexOf(name) + 1;
		if (nonBasicIndex > 0) {
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

	return {
		basic: newBasic,
		nonBasic: newNonBasic,
		coefficients: newCoefficients,
	};
}

/** Solve an optimization problem in standard dictionary form.  By convention, all variable names should be positive (so non-zero) integers. */
export function solveStandardForm(dict: Dictionary) {
	if (needsTwoPhase(dict)) {
		let p = makeSpecial(dict);
		{
			const next = pivot(p, true);
			if (!next) {
				return null;
			}
			p = next;
		}
		for (let loop = 0; ; loop++) {
			if (loop === 200) {
				console.error("Possible cycle detected");
				return null;
			}
			const next = pivot(p, false);
			if (!next) {
				break;
			}
			p = next;
		}
		if (p.coefficients[p.basic.length * cols(p)].sign() < 0) {
			return null;
		}
		dict = makeRegular(p, dict);
	}
	for (let loop = 0; ; loop++) {
		if (loop === 200) {
			console.error("Possible cycle detected");
			return null;
		}
		const next = pivot(dict, false);
		if (!next) {
			break;
		}
		dict = next;
	}
	return dict;
}

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

export function equal(x: Dictionary | null, y: Dictionary | null) {
	if (!x || !y) {
		return x == y;
	}
	if (
		x.basic.length !== y.basic.length ||
		x.nonBasic.length !== y.nonBasic.length ||
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
	const pitch = cols(x);
	const nRows = rows(x);
	for (let j = 0; j < nRows; j++) {
		for (let i = 0; i < pitch; i++) {
			const yi = i === 0 ? 0 : nonBasicMap[i - 1] + 1;
			const yj = j === nRows - 1 ? j : basicMap[j];

			const xv = x.coefficients[j * pitch + i];
			const yv = y.coefficients[yj * pitch + yi];
			if (xv.neq(yv)) {
				return false;
			}
		}
	}
	return true;
}

/*
// Basic junk display widget for a Dictionary
function MatrixDisplay() {
	const [s, cs] = useState("");
  let otherDom = null;
  try {
  	const [rows, cols, coeffs] = s.split(";").map(z => z.split(","));
    const nodes = [];
    const idx = (i, j, v) => nodes[j * (cols.length +  2) + i] = <div>{v}</div>;
    
    for (let j = 0; j < rows.length; j++) {
    idx(0, j, <strong>x{rows[j]}</strong>);
    }
    idx(0, rows.length, "wp=");
    let c = 0;
    for (let j = 0; j <= rows.length; j++) {
      for (let i = 1; i <= cols.length + 1; i++) {
	    	let name = i > 1 ? <b> x{cols[i - 2]}</b> : null;
        idx(i, j, <React.Fragment>{coeffs[c++]}{name}</React.Fragment>);
      }
    }
    otherDom = <div class="tabel" style={{ gridTemplate: `1fr / ${"1fr ".repeat(cols.length + 2)}` }}>{nodes}</div>;
  } catch (e) {
  	otherDom = e && e.message;
  }
  return (
  	<div>
  	  <input type="text" value={s} onChange={ev => cs(ev.currentTarget.value)} />
      <div>
        {otherDom}
      </div>
  	</div>
  );
}
*/
