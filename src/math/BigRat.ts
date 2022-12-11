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

export class BigRat {
	constructor(private p: bigint, private q: bigint) {
		if (q === 0n) {
			throw new RangeError("BigRat divide by zero");
		}
		this.reduce();
	}
	private reduce() {
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
	abs() {
		return new BigRat(abs(this.p), abs(this.q));
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
}

export const ZERO = new BigRat(0n, 1n);
export const ONE = new BigRat(1n, 1n);
export const MINUS_ONE = new BigRat(-1n, 1n);
