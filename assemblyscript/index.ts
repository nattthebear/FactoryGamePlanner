export function gcd(a: u64, b: u64): u64 {
	if (a === 0) {
		return b;
	}
	if (b === 0) {
		return 0;
	}
	const ka = ctz(a);
	const kb = ctz(b);
	a >>= ka;
	b >>= kb;
	const k = min(ka, kb);

	while (true) {
		if (a > b) {
			const tmp = a;
			a = b;
			b = tmp;
		}
		b -= a;
		if (b === 0) {
			return a << k;
		}

		b >>= ctz(b);
	}
}
