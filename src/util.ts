import { Point } from "./store/Common";

export const FACTORY_SIZE = 4000;
export const FACTORY_MIN: Point = { x: -FACTORY_SIZE / 2, y: -FACTORY_SIZE / 2 };
export const FACTORY_MAX: Point = { x: FACTORY_SIZE / 2, y: FACTORY_SIZE / 2 };

export function clamp(n: number, min: number, max: number) {
	if (n < min) {
		return min;
	}
	if (n > max) {
		return max;
	}
	return n;
}
