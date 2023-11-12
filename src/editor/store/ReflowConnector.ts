import { State } from "./Store";
import { Draft } from "../../immer";
import { NodeId } from "./Common";
import { BigRat } from "../../math/BigRat";
import { Dictionary, solveStandardFormMutate } from "../../solver/Dictionary";

/**
 * Recomputes the rate some connectors, and other connectors connected to them.
 * @param draft
 * @param connectorIds Zero or more connector ids that need to be rated
 * @returns the set of all connectorIds that were rerated
 */
export function reflowConnectors(draft: Draft<State>, connectorIds: Iterable<NodeId>) {
	const todo = new Set<NodeId>(connectorIds);
	const connectorMaps = new Map<NodeId, number>();

	const producerTerminals = new Map<
		string,
		{
			rate: BigRat;
			connectors: NodeId[];
		}
	>();

	const nonBasic = [];
	const basic = [];

	let nextVariable = 1;

	for (const id of todo) {
		const c = draft.connectors.get(id)!;
		connectorMaps.set(id, nextVariable);
		nonBasic.push(nextVariable++);

		const pin = draft.producers.get(c.input)!;
		const pout = draft.producers.get(c.output)!;

		const keyIn = `i-${c.input}-${c.inputIndex}`;
		const keyOut = `o-${c.output}-${c.outputIndex}`;

		if (!producerTerminals.has(keyIn)) {
			const connectors = pin.outputs[c.inputIndex];
			producerTerminals.set(keyIn, { rate: pin.outputFlows()[c.inputIndex].rate, connectors });
			for (const otherId of connectors) {
				todo.add(otherId);
			}
		}
		if (!producerTerminals.has(keyOut)) {
			const connectors = pout.inputs[c.outputIndex];
			producerTerminals.set(keyOut, { rate: pout.inputFlows()[c.outputIndex].rate, connectors });
			for (const otherId of connectors) {
				todo.add(otherId);
			}
		}
	}

	const nCols = todo.size + 1;
	const nRows = producerTerminals.size + 1;

	const coefficients = Array<BigRat>(nCols * nRows).fill(BigRat.ZERO);

	{
		let row = 0;
		for (const { rate, connectors } of producerTerminals.values()) {
			basic.push(nextVariable++);
			for (const id of connectors) {
				const col = connectorMaps.get(id)! - 1;
				coefficients[row * nCols + col] = BigRat.MINUS_ONE;
			}
			coefficients[(row + 1) * nCols - 1] = rate;
			row += 1;
		}
		for (let col = 0; col < nCols - 1; col++) {
			coefficients[row * nCols + col] = BigRat.ONE;
		}
	}

	const dictionary = solveStandardFormMutate(new Dictionary(basic, nonBasic, false, coefficients))!;

	for (const [connectorId, variableName] of connectorMaps) {
		const connector = draft.connectors.get(connectorId)!;
		const row = dictionary.basic.indexOf(variableName);
		const rate = dictionary.coefficients[(row + 1) * nCols - 1];
		connector.rate = rate;
	}

	return todo;
}
