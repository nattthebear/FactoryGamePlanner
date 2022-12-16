import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";

export interface Point {
	x: number;
	y: number;
}

export const toTranslation = (p: Point) => `translate(${p.x}px, ${p.y}px)`;

export interface Flow {
	/** nominal rate per minute */
	rate: BigRat;
	item: Item;
}

const BrandSymbol = Symbol();
export type NodeId = { [BrandSymbol]: null };

export const generateId = (() => {
	let nextId = 1;
	return () => nextId++ as any as NodeId;
})();

export const SIXTY = new BigRat(60n, 1n);
