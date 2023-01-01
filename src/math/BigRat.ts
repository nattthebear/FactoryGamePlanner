import { immerable } from "../immer";

export function gcd(a: number, b: number) {
	while (b !== 0) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}

const BIGRAT_REGEX = /^-?\d+(\.\d+)?$/;

let goingToCheck = false;

// Privates are public so that Draft<BigRat> and BigRat are compatible.
// At runtime, BigRats will not be drafted as they're not immerable, so it only matters in types.
export class BigRat {
	readonly [immerable] = false;
	private p: number;
	private q: number;
	/** Create a BigRat from numerator and denominator.  No checking. */
	private constructor(p: number, q: number) {
		this.p = p;
		this.q = q;
		if (!goingToCheck) {
			const checked = gcd(p, q);
			if (checked !== 1 && checked !== -1) {
				debugger;
			}
		}
	}
	private checkAndReduce() {
		const d = gcd(this.p, this.q);
		if (d !== 1) {
			this.p /= d;
			this.q /= d;
		}
		if (this.q < 0) {
			this.p = -this.p;
			this.q = -this.q;
		}
	}
	private static createWithCheck(p: number, q: number) {
		if (q === 0) {
			throw new RangeError("BigRat divide by zero");
		}
		let ret: BigRat;
		try {
			goingToCheck = true;
			ret = new BigRat(p, q);
		} finally {
			goingToCheck = false;
		}
		ret.checkAndReduce();
		return ret;
	}
	static tryParse(s: string) {
		const match = s.match(BIGRAT_REGEX);
		if (!match) {
			return null;
		}
		const decimalPart = match[1];
		if (decimalPart) {
			return BigRat.createWithCheck(Number(s.replace(".", "")), Number("1".padEnd(decimalPart.length, "0")));
		} else {
			return BigRat.createWithCheck(Number(s), 1);
		}
	}
	static parse(s: string) {
		const res = BigRat.tryParse(s);
		if (!res) {
			throw new TypeError("BigRat parse error");
		}
		return res;
	}
	static fromInteger(n: number) {
		if ((n | 0) !== n) {
			throw new TypeError("Number is not an integer");
		}
		return new BigRat(n, 1);
	}
	static create(p: number, q: number) {
		if (Math.round(p) !== p || Math.round(q) !== q) {
			throw new TypeError("Numbers must be integers");
		}
		return BigRat.createWithCheck(p, q);
	}
	static fromRatioString(s: string) {
		const match = s.match(/^(\d+):(\d+)$/);
		if (!match) {
			throw new TypeError("BigRat parse error");
		}
		const [, p, q] = match;
		return BigRat.createWithCheck(Number(p), Number(q));
	}

	terms() {
		return { p: this.p, q: this.q };
	}
	toNumberApprox() {
		return this.p / this.q;
	}
	toRatioString() {
		return `${this.p}:${this.q}`;
	}
	static eq(x: BigRat, y: BigRat) {
		return x.p * y.q === x.q * y.p;
	}
	static gt(x: BigRat, y: BigRat) {
		return x.p * y.q > x.q * y.p;
	}
	static lt(x: BigRat, y: BigRat) {
		return x.p * y.q < x.q * y.p;
	}
	static gte(x: BigRat, y: BigRat) {
		return x.p * y.q >= x.q * y.p;
	}
	static lte(x: BigRat, y: BigRat) {
		return x.p * y.q <= x.q * y.p;
	}
	static neq(x: BigRat, y: BigRat) {
		return x.p * y.q !== x.q * y.p;
	}
	static compare(x: BigRat, y: BigRat) {
		const xa = x.p * y.q;
		const ya = x.q * y.p;
		if (xa < ya) {
			return -1;
		}
		if (xa > ya) {
			return 1;
		}
		return 0;
	}

	static add(x: BigRat, y: BigRat) {
		const g = gcd(x.q, y.q);
		const xq = x.q / g;
		const yq = y.q / g;
		const xp = yq * x.p;
		const yp = xq * y.p;
		const p = xp + yp;
		const q = xq * y.q;
		return BigRat.createWithCheck(p, q);
	}
	static sub(x: BigRat, y: BigRat) {
		const g = gcd(x.q, y.q);
		const xq = x.q / g;
		const yq = y.q / g;
		const xp = yq * x.p;
		const yp = xq * y.p;
		const p = xp - yp;
		const q = xq * y.q;
		return BigRat.createWithCheck(p, q);
	}
	static mul(x: BigRat, y: BigRat) {
		let a = x.p;
		let b = x.q;
		let c = y.p;
		let d = y.q;

		if (a === 0 || c === 0) {
			return BigRat.ZERO;
		}

		const g1 = gcd(a, d);
		const g2 = gcd(b, c);
		let p = (a / g1) * (c / g2);
		let q = (b / g2) * (d / g1);
		if (q < 0) {
			q = -q;
			p = -p;
		}

		return new BigRat(p, q);
	}
	static div(x: BigRat, y: BigRat) {
		let a = x.p;
		let b = x.q;
		let c = y.p;
		let d = y.q;
		if (c === 0) {
			throw new RangeError("BigRat divide by zero");
		}
		if (a === 0) {
			return BigRat.ZERO;
		}

		const g1 = gcd(a, c);
		const g2 = gcd(b, d);
		let p = (a / g1) * (d / g2);
		let q = (b / g2) * (c / g1);
		if (q < 0) {
			q = -q;
			p = -p;
		}

		return new BigRat(p, q);
	}
	eq(y: BigRat) {
		return this.p * y.q === this.q * y.p;
	}
	gt(y: BigRat) {
		return this.p * y.q > this.q * y.p;
	}
	lt(y: BigRat) {
		return this.p * y.q < this.q * y.p;
	}
	gte(y: BigRat) {
		return this.p * y.q >= this.q * y.p;
	}
	lte(y: BigRat) {
		return this.p * y.q <= this.q * y.p;
	}
	neq(y: BigRat) {
		return this.p * y.q !== this.q * y.p;
	}
	add(y: BigRat) {
		if (this.p === 0) {
			return y;
		}
		if (y.p === 0) {
			return this;
		}
		return BigRat.add(this, y);
	}
	sub(y: BigRat) {
		return BigRat.sub(this, y);
	}
	mul(y: BigRat) {
		if (this.p === 0 || y.p === 0) {
			return BigRat.ZERO;
		}
		return BigRat.mul(this, y);
	}
	div(y: BigRat) {
		if (this.p === 0) {
			return this;
		}
		return BigRat.div(this, y);
	}
	fma(x: BigRat, y: BigRat) {
		if (x.p === 0 || y.p === 0) {
			return this;
		}
		return BigRat.add(this, BigRat.mul(x, y));
	}
	abs() {
		return new BigRat(Math.abs(this.p), this.q);
	}
	neg() {
		return new BigRat(-this.p, this.q);
	}
	sign() {
		return Math.sign(this.p) + 0;
	}
	debug() {
		return `${this.p}:${this.q}`;
	}
	static ZERO = new BigRat(0, 1);
	static ONE = new BigRat(1, 1);
	static MINUS_ONE = new BigRat(-1, 1);
}
