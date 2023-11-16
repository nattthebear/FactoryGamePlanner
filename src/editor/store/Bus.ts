import { immerable } from "../../immer";
import { Point } from "../../util";
import { generateId, NodeId } from "./Common";

export interface BusTerminal {
	rxIn: number;
	rxOut: number;
	id: NodeId;
}

export function compareTerminals(a: BusTerminal, b: BusTerminal) {
	return a.rxIn - b.rxIn;
}

export class Bus implements Point {
	[immerable] = true;
	id = generateId();

	x: number;
	y: number;
	width: number;

	terminals: BusTerminal[] = [];

	constructor(x: number, y: number, width: number) {
		this.x = x;
		this.y = y;
		this.width = width;
	}
}
