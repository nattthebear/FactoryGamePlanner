import { immerable } from "../immer";

export function gcd(a: bigint, b: bigint) {
	while (b !== 0n) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}
export const abs = (value: bigint) => (value < 0n ? -value : value);

const BIGRAT_REGEX = /^-?\d+(\.\d+)?$/;

// Privates are public so that Draft<BigRat> and BigRat are compatible.
// At runtime, BigRats will not be drafted as they're not immerable, so it only matters in types.
export class BigRat {
	readonly [immerable] = false;
	private p: bigint;
	private q: bigint;
	/** Create a BigRat from numerator and denominator */
	constructor(p: bigint, q: bigint) {
		if (q === 0n) {
			throw new RangeError("BigRat divide by zero");
		}
		this.p = p;
		this.q = q;
		this.reduce();
	}
	private reduce() {
		const d = gcd(this.p, this.q);
		if (d !== 1n) {
			this.p /= d;
			this.q /= d;
		}
		if (this.q < 0n) {
			this.p = -this.p;
			this.q = -this.q;
		}
	}
	terms() {
		return { p: this.p, q: this.q };
	}
	toNumberApprox() {
		return Number(this.p) / Number(this.q);
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
		return new BigRat(x.p * y.q + x.q * y.p, x.q * y.q);
	}
	static sub(x: BigRat, y: BigRat) {
		return new BigRat(x.p * y.q - x.q * y.p, x.q * y.q);
	}
	static mul(x: BigRat, y: BigRat) {
		return new BigRat(x.p * y.p, x.q * y.q);
	}
	static div(x: BigRat, y: BigRat) {
		return new BigRat(x.p * y.q, x.q * y.p);
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
		if (this.p === 0n) {
			return y;
		}
		if (y.p === 0n) {
			return this;
		}
		return new BigRat(this.p * y.q + this.q * y.p, this.q * y.q);
	}
	sub(y: BigRat) {
		return new BigRat(this.p * y.q - this.q * y.p, this.q * y.q);
	}
	mul(y: BigRat) {
		if (this.p === 0n || y.p === 0n) {
			return BigRat.ZERO;
		}
		return new BigRat(this.p * y.p, this.q * y.q);
	}
	div(y: BigRat) {
		if (this.p === 0n) {
			return this;
		}
		return new BigRat(this.p * y.q, this.q * y.p);
	}
	fma(x: BigRat, y: BigRat) {
		if (x.p === 0n || y.p === 0n) {
			return this;
		}
		const rp = x.p * y.p;
		const rq = x.q * y.q;
		return new BigRat(this.p * rq + this.q * rp, this.q * rq);
	}
	abs() {
		return new BigRat(abs(this.p), this.q);
	}
	neg() {
		return new BigRat(-this.p, this.q);
	}
	sign() {
		const { p } = this;
		return p > 0n ? 1 : p < 0n ? -1 : 0;
	}
	debug() {
		return `${this.p}:${this.q}`;
	}
	static tryParse(s: string) {
		const match = s.match(BIGRAT_REGEX);
		if (!match) {
			return null;
		}
		const decimalPart = match[1];
		if (decimalPart) {
			return new BigRat(BigInt(s.replace(".", "")), BigInt("1".padEnd(decimalPart.length, "0")));
		} else {
			return new BigRat(BigInt(s), 1n);
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
		return new BigRat(BigInt(n), 1n);
	}
	static fromRatioString(s: string) {
		const match = s.match(/^(\d+):(\d+)$/);
		if (!match) {
			throw new TypeError("BigRat parse error");
		}
		const [, p, q] = match;
		return new BigRat(BigInt(p), BigInt(q));
	}
	static ZERO = new BigRat(0n, 1n);
	static ONE = new BigRat(1n, 1n);
	static MINUS_ONE = new BigRat(-1n, 1n);
}
