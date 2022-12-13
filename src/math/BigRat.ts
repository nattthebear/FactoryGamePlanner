export function gcd(a: bigint, b: bigint) {
	for (let t: bigint; b !== 0n; ) {
		t = b;
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
	/**
	 * @param p EXTERNAL: DO NOT TOUCH THIS
	 * @param q EXTERNAL: DO NOT TOUCH THIS
	 */
	constructor(public p: bigint, public q: bigint) {
		if (q === 0n) {
			throw new RangeError("BigRat divide by zero");
		}
		this.reduce();
	}
	/** EXTERNAL: DO NOT CALL THIS */
	public reduce() {
		const d = gcd(this.p, this.q);
		if (d !== 1n) {
			this.p /= d;
			this.q /= d;
		}
	}
	terms() {
		return { p: this.p, q: this.q };
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
		return new BigRat(this.p * y.q + this.q * y.p, this.q * y.q);
	}
	sub(y: BigRat) {
		return new BigRat(this.p * y.q - this.q * y.p, this.q * y.q);
	}
	mul(y: BigRat) {
		return new BigRat(this.p * y.p, this.q * y.q);
	}
	div(y: BigRat) {
		return new BigRat(this.p * y.q, this.q * y.p);
	}
	abs() {
		return new BigRat(abs(this.p), abs(this.q));
	}
	neg() {
		return new BigRat(-this.p, this.q);
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
	static ZERO = new BigRat(0n, 1n);
	static ONE = new BigRat(1n, 1n);
	static MINUS_ONE = new BigRat(-1n, 1n);
}
