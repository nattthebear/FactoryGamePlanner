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

/**
 * Find the index to insert a new terminal at to maintain order
 */
export function findTerminalIndex(terminals: BusTerminal[], rxIn: number) {
	let a = 0;
	let b = terminals.length - 1;
	if (b < 0 || rxIn <= terminals[a].rxIn) {
		return a;
	}
	if (rxIn > terminals[b].rxIn) {
		return b + 1;
	}

	while (b - a > 1) {
		const c = (a + b) >> 1;
		if (rxIn > terminals[c].rxIn) {
			a = c;
		} else {
			b = c;
		}
	}
	return b;
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
