import { immerable } from "../../immer";
import { generateId, NodeId } from "./Common";

export interface BusTerminal {
	x: number;
	id: NodeId;
}

export function compareTerminals(a: BusTerminal, b: BusTerminal) {
	return a.x - b.x;
}

export class Bus {
	[immerable] = true;
	id = generateId();

	x1: number;
	x2: number;
	y: number;

	terminals: BusTerminal[] = [];

	constructor(x1: number, x2: number, y: number) {
		this.x1 = x1;
		this.x2 = x2;
		this.y = y;
	}
}
