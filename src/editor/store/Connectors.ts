import { immerable } from "../../immer";
import { Item } from "../../../data/types";
import { BigRat } from "../../math/BigRat";
import { Flow } from "../../util";
import { generateId, NodeId } from "./Common";

export class Connector {
	[immerable] = true;
	id = generateId();

	/** Items per minute */
	rate: BigRat;
	item: Item;

	input: NodeId;
	output: NodeId;

	inputIndex: number;
	outputIndex: number;

	constructor(rate: BigRat, item: Item, input: NodeId, output: NodeId, inputIndex: number, outputIndex: number) {
		this.rate = rate;
		this.item = item;
		this.input = input;
		this.output = output;
		this.inputIndex = inputIndex;
		this.outputIndex = outputIndex;
	}

	flow(): Flow {
		return { rate: this.rate, item: this.item };
	}
}
