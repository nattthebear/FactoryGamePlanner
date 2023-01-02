#![no_std]
#![feature(core_intrinsics)]

#[panic_handler]
fn panic(_: &core::panic::PanicInfo<'_>) -> ! {
	core::intrinsics::abort()
}

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

struct XorShift32 {
	state: u32
}

impl XorShift32 {
	pub fn seed(mut value: u32) -> XorShift32 {
		if value == 0 {
			value = 1;
		}
		XorShift32 { state: value }
	}

	pub fn next(&mut self) -> u32 {
		let mut x = self.state;
		x ^= x << 13;
		x ^= x >> 17;
		x ^= x << 5;
		self.state = x;
		x
	}
}

#[no_mangle]
pub fn test_num_bigint(seed: u32, mut rounds: u32) -> u32 {
	use core::slice;
	use num_rational::BigRational;
	use num_bigint::{BigInt, Sign};

	let mut r = XorShift32::seed(seed);

	let one = 1u32;

	let mut acc = BigRational::from_integer(BigInt::from_slice(Sign::Plus, slice::from_ref(&one)));
	
	while rounds != 0 {
		let p = r.next();
		let q = r.next();

		let val = BigRational::new(
			BigInt::from_slice(Sign::Plus, slice::from_ref(&p)),
			BigInt::from_slice(Sign::Plus, slice::from_ref(&q))
		);
		acc -= val;

		rounds -= 1;
	}

	match acc.numer().iter_u32_digits().next() {
		Some(ret) => ret,
		None => 0,
	}
}

use ibig::{IBig, UBig, ops::{UnsignedAbs}};

struct IBigRat {
	p: IBig,
	q: IBig,
}

impl IBigRat {
	pub fn new_from_uints(p: u32, q: u32) -> Self {
		let mut ret = Self { p: IBig::from(p), q: IBig::from(q) };
		ret.reduce();
		ret
	}
	
	fn gcd(mut a: IBig, mut b: IBig) -> IBig {
		let ZERO = IBig::from(0u8);
		while b != ZERO {
			let nextB = &a % &b;
			a = b;
			b = nextB;
		}
		a
	}

	fn reduce(&mut self) {
		let ONE = IBig::from(1u8);
		let ZERO = IBig::from(0u8);
		let d = Self::gcd(self.p.clone(), self.q.clone());
		if d != ONE {
			self.p /= &d;
			self.q /= &d;
		}
		if self.q.signum() < ZERO {
			self.p = -&self.p;
			self.q = -&self.q;
		}
	}

	pub fn sub(x: &Self, y: &Self) -> Self {
		// return new BigRat(x.p * y.q - x.q * y.p, x.q * y.q);
		let mut ret = Self {
			p: &x.p * &y.p,
			q: &x.q * &y.q,
		};
		ret.reduce();
		ret
	}

	pub fn toNumer(self) -> IBig {
		self.p
	}
	
}


#[no_mangle]
pub fn test_ibig(seed: u32, mut rounds: u32) -> u32 {
	let mut r = XorShift32::seed(seed);

	let mut acc = IBigRat::new_from_uints(1, 1);

	while rounds != 0 {
		let p = r.next();
		let q = r.next();

		let val = IBigRat::new_from_uints(p, q);
		acc = IBigRat::sub(&acc, &val);

		rounds -= 1;
	}

	let res = acc.toNumer().unsigned_abs() & UBig::from(0xffffffffu32);
	res.to_f64() as u32
}

#[no_mangle]
pub fn test_num_ratio_i128(seed: u32, mut rounds: u32) -> u32 {
	use num_rational::Ratio;

	let mut r = XorShift32::seed(seed);

	let mut acc = Ratio::<i128>::from_integer(1);
	
	while rounds != 0 {
		let p = r.next();
		let q = r.next();

		let val = Ratio::<i128>::new(p as i128, q as i128);
		acc -= val;

		rounds -= 1;
	}

	acc.numer().abs() as u32
}
