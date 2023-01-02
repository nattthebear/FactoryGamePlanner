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

use core::slice;
use num_rational::BigRational;
use num_bigint::{ BigInt, Sign };

#[no_mangle]
pub fn foobaz(seed: u32, mut rounds: u32) -> u32 {
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
