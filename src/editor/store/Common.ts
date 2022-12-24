import { Item } from "../../../data/types";
import { BigRat } from "../../math/BigRat";
import { Point } from "../../util";

export const toTranslation = (p: Point) => `translate(${p.x}px, ${p.y}px)`;

export function pointEqual(a: Point, b: Point) {
	return a.x === b.x && a.y === b.y;
}

export function pointAdd(a: Point, b: Point) {
	return { x: a.x + b.x, y: a.y + b.y };
}

export function pointDist(a: Point, b: Point) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

const BrandSymbol = Symbol();
export type NodeId = { [BrandSymbol]: null };

export const generateId = (() => {
	let nextId = 1;
	return () => nextId++ as any as NodeId;
})();

export const SIXTY = new BigRat(60n, 1n);
