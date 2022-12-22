export interface Point {
	x: number;
	y: number;
}

export const FACTORY_SIZE = 4000;
export const FACTORY_MIN: Point = { x: -FACTORY_SIZE / 2, y: -FACTORY_SIZE / 2 };
export const FACTORY_MAX: Point = { x: FACTORY_SIZE / 2, y: FACTORY_SIZE / 2 };

export const BUILDING_BORDER = 500;
export const BUILDING_MIN = { x: FACTORY_MIN.x + BUILDING_BORDER, y: FACTORY_MIN.y + BUILDING_BORDER };
export const BUILDING_MAX = { x: FACTORY_MAX.x - BUILDING_BORDER, y: FACTORY_MAX.y - BUILDING_BORDER };

export function clamp(n: number, min: number, max: number) {
	if (n < min) {
		return min;
	}
	if (n > max) {
		return max;
	}
	return n;
}

export function clampp(p: Point, min: Point, max: Point) {
	return {
		x: clamp(p.x, min.x, max.x),
		y: clamp(p.y, min.y, max.y),
	};
}
