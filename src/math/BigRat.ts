import { immerable } from "../immer";

export function gcd(a: bigint, b: bigint) {
	while (b !== 0n) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}
export function gcdn(a: number, b: number) {
	while (b !== 0) {
		const t = b;
		b = a % b;
		a = t;
	}
	return a;
}

export const abs = (value: bigint) => (value < 0n ? -value : value);

const BIGRAT_REGEX = /^-?\d+(\.\d+)?$/;

const { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } = Number;
const MIN_SAFE_BIGINT = BigInt(MIN_SAFE_INTEGER);
const MAX_SAFE_BIGINT = BigInt(MAX_SAFE_INTEGER);

export class BigRat {
	readonly [immerable] = false;

	private ps: number | undefined;
	private qs: number | undefined;

	private pb: bigint | undefined;
	private qb: bigint | undefined;

	private constructor() {}

	static fromBigInts(p: bigint, q: bigint) {
		if (q === 0n) {
			throw new RangeError("BigRat divide by zero");
		}
		const d = gcd(p, q);
		if (d !== 1n) {
			p /= d;
			q /= d;
		}
		if (q < 0n) {
			p = -p;
			q = -q;
		}
		const ret = new BigRat();
		if (p >= MIN_SAFE_BIGINT && p <= MAX_SAFE_BIGINT && q <= MAX_SAFE_BIGINT) {
			ret.ps = Number(p);
			ret.qs = Number(q);
		} else {
			ret.pb = p;
			ret.qb = q;
		}
		return ret;
	}

	static fromInteger(n: number) {
		// This is needlessly restrictive, but we've only used this method for constants so far
		if ((n | 0) !== n) {
			throw new TypeError("Number is not an integer");
		}
		const ret = new BigRat();
		ret.ps = n;
		ret.qs = 1;
		return ret;
	}

	static fromIntegers(p: number, q: number) {
		if (q === 0) {
			throw new RangeError("BigRat divide by zero");
		}
		if (p < MIN_SAFE_INTEGER || p > MAX_SAFE_INTEGER || q < MIN_SAFE_INTEGER || q > MAX_SAFE_INTEGER) {
			throw new TypeError("Numbers are out of range");
		}
		const d = gcdn(p, q);
		if (d !== 1) {
			p /= d;
			q /= d;
		}
		if (q < 0) {
			p = -p;
			q = -q;
		}
		const ret = new BigRat();
		ret.ps = p;
		ret.qs = q;
		return ret;
	}

	static tryParse(s: string) {
		const match = s.match(BIGRAT_REGEX);
		if (!match) {
			return null;
		}
		const decimalPart = match[1];
		if (decimalPart) {
			return BigRat.fromBigInts(BigInt(s.replace(".", "")), BigInt("1".padEnd(decimalPart.length, "0")));
		} else {
			return BigRat.fromBigInts(BigInt(s), 1n);
		}
	}

	static parse(s: string) {
		const res = BigRat.tryParse(s);
		if (!res) {
			throw new TypeError("BigRat parse error");
		}
		return res;
	}

	static fromRatioString(s: string) {
		const match = s.match(/^(-?\d+):(\d+)$/);
		if (!match) {
			throw new TypeError("BigRat parse error");
		}
		const [, p, q] = match;
		return BigRat.fromBigInts(BigInt(p), BigInt(q));
	}

	terms() {
		return { p: this.pb ?? BigInt(this.ps!), q: this.qb ?? BigInt(this.qs!) };
	}

	toNumberApprox() {
		return this.pb != null ? Number(this.pb) / Number(this.qb!) : this.ps! / this.qs!;
	}

	toRatioString() {
		return `${this.pb ?? this.ps}:${this.qb ?? this.qs}`;
	}

	static compare(x: BigRat, y: BigRat) {
		const xpb = x.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(x.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (x.qb ?? BigInt(x.qs!)) * (ypb ?? BigInt(y.ps!));
			if (xa < ya) {
				return -1;
			}
			if (xa > ya) {
				return 1;
			}
			return 0;
		}
		const xa = x.ps! * y.qs!;
		const ya = x.qs! * y.ps!;
		if (xa < ya) {
			return -1;
		}
		if (xa > ya) {
			return 1;
		}
		return 0;
	}

	eq(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa === ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa === ya;
	}
	gt(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa > ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa > ya;
	}
	lt(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa < ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa < ya;
	}
	gte(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa >= ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa >= ya;
	}
	lte(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa <= ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa <= ya;
	}
	neq(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const xa = (xpb ?? BigInt(this.ps!)) * (y.qb ?? BigInt(y.qs!));
			const ya = (this.qb ?? BigInt(this.qs!)) * (ypb ?? BigInt(y.ps!));
			return xa !== ya;
		}
		const xa = this.ps! * y.qs!;
		const ya = this.qs! * y.ps!;
		return xa !== ya;
	}

	add(y: BigRat) {
		if (this.pb === 0n || this.ps === 0) {
			return y;
		}
		if (y.pb === 0n || y.ps === 0) {
			return this;
		}
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const a = xpb ?? BigInt(this.ps!);
			const b = this.qb ?? BigInt(this.qs!);
			const c = ypb ?? BigInt(y.ps!);
			const d = y.qb ?? BigInt(y.qs!);
			const p = a * d + b * c;
			const q = b * d;
			return BigRat.fromBigInts(p, q);
		} else {
			const a = this.ps!;
			const b = this.qs!;
			const c = y.ps!;
			const d = y.qs!;
			const p = a * d + b * c;
			const q = b * d;
			if (q <= MAX_SAFE_INTEGER && p >= MIN_SAFE_INTEGER && p <= MAX_SAFE_INTEGER) {
				return BigRat.fromIntegers(p, q);
			} else {
				const a = xpb ?? BigInt(this.ps!);
				const b = this.qb ?? BigInt(this.qs!);
				const c = ypb ?? BigInt(y.ps!);
				const d = y.qb ?? BigInt(y.qs!);
				const p = a * d + b * c;
				const q = b * d;
				return BigRat.fromBigInts(p, q);
			}
		}
	}
	sub(y: BigRat) {
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const a = xpb ?? BigInt(this.ps!);
			const b = this.qb ?? BigInt(this.qs!);
			const c = ypb ?? BigInt(y.ps!);
			const d = y.qb ?? BigInt(y.qs!);
			const p = a * d - b * c;
			const q = b * d;
			return BigRat.fromBigInts(p, q);
		} else {
			const a = this.ps!;
			const b = this.qs!;
			const c = y.ps!;
			const d = y.qs!;
			const p = a * d - b * c;
			const q = b * d;
			if (q <= MAX_SAFE_INTEGER && p >= MIN_SAFE_INTEGER && p <= MAX_SAFE_INTEGER) {
				return BigRat.fromIntegers(p, q);
			} else {
				const a = xpb ?? BigInt(this.ps!);
				const b = this.qb ?? BigInt(this.qs!);
				const c = ypb ?? BigInt(y.ps!);
				const d = y.qb ?? BigInt(y.qs!);
				const p = a * d - b * c;
				const q = b * d;
				return BigRat.fromBigInts(p, q);
			}
		}
	}
	mul(y: BigRat) {
		if (this.pb === 0n || this.ps === 0 || y.pb === 0n || y.ps === 0) {
			return BigRat.ZERO;
		}
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const a = xpb ?? BigInt(this.ps!);
			const b = this.qb ?? BigInt(this.qs!);
			const c = ypb ?? BigInt(y.ps!);
			const d = y.qb ?? BigInt(y.qs!);
			const p = a * c;
			const q = b * d;
			return BigRat.fromBigInts(p, q);
		} else {
			const a = this.ps!;
			const b = this.qs!;
			const c = y.ps!;
			const d = y.qs!;
			const p = a * c;
			const q = b * d;
			if (q <= MAX_SAFE_INTEGER && p >= MIN_SAFE_INTEGER && p <= MAX_SAFE_INTEGER) {
				return BigRat.fromIntegers(p, q);
			} else {
				const a = xpb ?? BigInt(this.ps!);
				const b = this.qb ?? BigInt(this.qs!);
				const c = ypb ?? BigInt(y.ps!);
				const d = y.qb ?? BigInt(y.qs!);
				const p = a * c;
				const q = b * d;
				return BigRat.fromBigInts(p, q);
			}
		}
	}
	div(y: BigRat) {
		if (this.pb === 0n || this.ps === 0) {
			return this;
		}
		const xpb = this.pb;
		const ypb = y.pb;
		if (xpb != null || ypb != null) {
			const a = xpb ?? BigInt(this.ps!);
			const b = this.qb ?? BigInt(this.qs!);
			const c = ypb ?? BigInt(y.ps!);
			const d = y.qb ?? BigInt(y.qs!);
			const p = a * d;
			const q = b * c;
			return BigRat.fromBigInts(p, q);
		} else {
			const a = this.ps!;
			const b = this.qs!;
			const c = y.ps!;
			const d = y.qs!;
			const p = a * d;
			const q = b * c;
			if (q >= MIN_SAFE_INTEGER && q <= MAX_SAFE_INTEGER && p >= MIN_SAFE_INTEGER && p <= MAX_SAFE_INTEGER) {
				return BigRat.fromIntegers(p, q);
			} else {
				const a = xpb ?? BigInt(this.ps!);
				const b = this.qb ?? BigInt(this.qs!);
				const c = ypb ?? BigInt(y.ps!);
				const d = y.qb ?? BigInt(y.qs!);
				const p = a * d;
				const q = b * c;
				return BigRat.fromBigInts(p, q);
			}
		}
	}

	fma(x: BigRat, y: BigRat) {
		if (x.pb === 0n || x.ps === 0 || y.pb === 0n || y.ps === 0) {
			return this;
		}
		// TODO: reoptimize this
		return this.add(x.mul(y));
		// const rp = x.p * y.p;
		// const rq = x.q * y.q;
		// return new BigRat(this.p * rq + this.q * rp, this.q * rq);
	}

	abs() {
		const { pb } = this;
		if (pb != null) {
			if (pb < 0n) {
				const ret = new BigRat();
				ret.pb = -pb;
				ret.qb = this.qb;
				return ret;
			} else {
				return this;
			}
		}
		const { ps } = this;
		if (ps! < 0) {
			const ret = new BigRat();
			ret.ps = -ps!;
			ret.qs = this.qs;
			return ret;
		} else {
			return this;
		}
	}
	neg() {
		const { pb } = this;
		if (pb != null) {
			if (pb !== 0n) {
				const ret = new BigRat();
				ret.pb = -pb;
				ret.qb = this.qb;
				return ret;
			} else {
				return this;
			}
		}
		const { ps } = this;
		if (ps! !== 0) {
			const ret = new BigRat();
			ret.ps = -ps!;
			ret.qs = this.qs;
			return ret;
		} else {
			return this;
		}
	}
	sign() {
		const { pb } = this;
		if (pb != null) {
			if (pb > 0n) {
				return 1;
			} else if (pb < 0n) {
				return -1;
			} else {
				return 0;
			}
		}
		const { ps } = this;
		if (ps! > 0) {
			return 1;
		} else if (ps! < 0) {
			return -1;
		} else {
			return 0;
		}
	}

	debug() {
		return this.toRatioString();
	}

	uneval() {
		if (this.pb != null) {
			return `BigRat.fromBigInts(${this.pb}n, ${this.qb}n)`;
		} else if (this.qs === 1) {
			return `BigRat.fromInteger(${this.ps})`;
		} else {
			return `BigRat.fromIntegers(${this.ps}, ${this.qs})`;
		}
	}

	static ZERO = BigRat.fromInteger(0);
	static ONE = BigRat.fromInteger(1);
	static MINUS_ONE = BigRat.fromInteger(-1);
}
