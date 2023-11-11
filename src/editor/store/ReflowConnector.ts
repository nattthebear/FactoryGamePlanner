import { State } from "./Store";
import { Draft } from "../../immer";
import { NodeId } from "./Common";
import { BigRat } from "../../math/BigRat";

/**
 * Recomputes the rate some connectors, and other connectors connected to them.
 * @param draft
 * @param connectorIds Zero or more connector ids that need to be rated
 * @returns the set of all connectorIds that were rerated
 */
export function reflowConnectors(draft: Draft<State>, connectorIds: Iterable<NodeId>) {
	const todo = new Set<NodeId>(connectorIds);

	const ratesUsed = new Map<string, BigRat>();

	for (const id of todo) {
		const c = draft.connectors.get(id)!;
		const pin = draft.producers.get(c.input)!;
		const pout = draft.producers.get(c.output)!;

		const keyIn = `i-${c.input}-${c.inputIndex}`;
		const keyOut = `o-${c.output}-${c.outputIndex}`;

		if (!ratesUsed.has(keyIn)) {
			ratesUsed.set(keyIn, pin.outputFlows()[c.inputIndex].rate);
		}
		if (!ratesUsed.has(keyOut)) {
			ratesUsed.set(keyOut, pout.inputFlows()[c.outputIndex].rate);
		}
		const rateIn = ratesUsed.get(keyIn)!;
		const rateOut = ratesUsed.get(keyOut)!;
		const newRate = rateIn.lt(rateOut) ? rateIn : rateOut;
		c.rate = newRate;
		ratesUsed.set(keyIn, rateIn.sub(newRate));
		ratesUsed.set(keyOut, rateOut.sub(newRate));

		for (const otherId of pin.outputs[c.inputIndex]) {
			todo.add(otherId);
		}
		for (const otherId of pout.inputs[c.outputIndex]) {
			todo.add(otherId);
		}
	}

	return todo;
}
