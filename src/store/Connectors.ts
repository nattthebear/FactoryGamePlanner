import { immerable } from "immer";
import { Item } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { Flow, generateId, NodeId } from "./Common";

export class Connector {
	[immerable] = true;
	id = generateId();

	/** Items per minute */
	rate: BigRat;
	item: Item;

	input: NodeId;
	output: NodeId;

	constructor(rate: BigRat, item: Item, input: NodeId, output: NodeId) {
		this.rate = rate;
		this.item = item;
		this.input = input;
		this.output = output;
	}

	flow(): Flow {
		return { rate: this.rate, item: this.item };
	}
}
