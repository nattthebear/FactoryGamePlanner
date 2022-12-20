import { BigRat } from "../math/BigRat";

// We proceed as in https://www.matem.unam.mx/~omar/math340

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

function isFeasible(dict: Dictionary) {
	const pitch = cols(dict);
	const max = pitch * rows(dict);
	const { coefficients } = dict;
	for (let a = 0; a < max; a += pitch) {
		if (coefficients[a].sign() < 0) {
			return false;
		}
	}
	return true;
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
			if (cmp == null || cmp === -1 || (cmp === 0 && varName > enterName)) {
				enterCol = idx + 1;
				enterName = varName;
				enterCoeff = coeff;
			}
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
			const coeff = coefficients[b].div(coefficients[a]).neg();
			if (coeff.sign() <= 0) {
				continue;
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
export function makeSpecial(dict: Dictionary) {
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

export {};
