import { Draft } from "immer";
import { Recipe } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { NodeId, SIXTY, pointAdd } from "./Common";
import { Connector } from "./Connectors";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { State } from "./Store";

function maybeSpliceValue<T>(array: T[], value: T) {
	const index = array.indexOf(value);
	if (index >= 0) {
		array.splice(index, 1);
	}
}

const sumConnections = (draft: Draft<State>, connections: NodeId[]) =>
	connections.reduce((acc, val) => acc.add(draft.connectors.get(val)!.rate), BigRat.ZERO);
const buildingInputExcess = (draft: Draft<State>, producer: Producer, inputIndex: number) =>
	sumConnections(draft, producer.inputs[inputIndex]).sub(producer.inputFlows()[inputIndex].rate);
const buildingOutputExcess = (draft: Draft<State>, producer: Producer, outputIndex: number) =>
	producer.outputFlows()[outputIndex].rate.sub(sumConnections(draft, producer.outputs[outputIndex]));

export const addProducer = (value: Producer) => (draft: Draft<State>) => {
	draft.producers.set(value.id, value);
};

export const removeProducer = (producerId: NodeId) => (draft: Draft<State>) => {
	const producer = draft.producers.get(producerId)!;
	for (const ids of producer.inputs) {
		for (const id of ids) {
			removeConnector(id)(draft);
		}
	}
	for (const ids of producer.outputs) {
		for (const id of ids) {
			removeConnector(id)(draft);
		}
	}
	draft.producers.delete(producerId);
};

export const addConnector =
	(
		from: { producerId: NodeId; outputIndex: number },
		to: { producerId: NodeId; inputIndex: number },
		match: "input" | "output"
	) =>
	(draft: Draft<State>) => {
		const fromProducer = draft.producers.get(from.producerId)!;
		const toProducer = draft.producers.get(to.producerId)!;

		const connector = new Connector(
			BigRat.ZERO,
			fromProducer.outputFlows()[from.outputIndex].item,
			fromProducer.id,
			toProducer.id,
			from.outputIndex,
			to.inputIndex
		);
		draft.connectors.set(connector.id, connector);
		fromProducer.outputs[from.outputIndex].push(connector.id);
		toProducer.inputs[to.inputIndex].push(connector.id);

		if (match === "input") {
			adjustConnectorInput(connector.id)(draft);
		} else {
			adjustConnectorOutput(connector.id)(draft);
		}
	};

export const removeConnector = (connectorId: NodeId) => (draft: Draft<State>) => {
	const connector = draft.connectors.get(connectorId)!;
	for (const output of draft.producers.get(connector.input)!.outputs) {
		maybeSpliceValue(output, connectorId);
	}
	for (const input of draft.producers.get(connector.output)!.inputs) {
		maybeSpliceValue(input, connectorId);
	}
};

const FIXUP_BUILDING_X_OFFSET = 300;
const FIXUP_SOURCE_X_OFFSET = 200;

/** Fix up by adding a new sink */
export const emptyToSink = (producerId: NodeId, outputIndex: number) => (draft: Draft<State>) => {
	const producer = draft.producers.get(producerId)!;
	const flow = producer.outputFlows()[outputIndex];

	const excess = buildingOutputExcess(draft, producer, outputIndex);
	if (excess.lte(BigRat.ZERO)) {
		return;
	}

	const referencePoint = pointAdd(producer, producer.outputAttachPoints[outputIndex]);

	const sink = new Sink(referencePoint.x + FIXUP_SOURCE_X_OFFSET, referencePoint.y, excess, flow.item);
	draft.producers.set(sink.id, sink);
	const connector = new Connector(excess, flow.item, producerId, sink.id, outputIndex, 0);
	draft.connectors.set(connector.id, connector);
	producer.outputs[outputIndex].push(connector.id);
	sink.inputs[0] = [connector.id];
};

/** Fix up by adding a new recipe that consumes this */
export const emptyToRecipe = (producerId: NodeId, outputIndex: number, recipe: Recipe) => (draft: Draft<State>) => {
	const producer = draft.producers.get(producerId)!;
	const flow = producer.outputFlows()[outputIndex];

	const excess = buildingOutputExcess(draft, producer, outputIndex);
	if (excess.lte(BigRat.ZERO)) {
		return;
	}

	const inputIndex = recipe.Inputs.findIndex((i) => i.Item.ClassName === flow.item.ClassName);
	const baseItemsPerSecond = recipe.Inputs[inputIndex].Quantity.div(recipe.Duration);
	const baseItemsPerMinute = baseItemsPerSecond.mul(SIXTY);
	const desiredRate = excess.div(baseItemsPerMinute);

	const referencePoint = pointAdd(producer, producer.outputAttachPoints[outputIndex]);

	const sink = new ProductionBuilding(
		referencePoint.x + FIXUP_BUILDING_X_OFFSET,
		referencePoint.y,
		desiredRate,
		recipe
	);
	draft.producers.set(sink.id, sink);
	const connector = new Connector(excess, flow.item, producerId, sink.id, outputIndex, inputIndex);
	draft.connectors.set(connector.id, connector);
	producer.outputs[outputIndex].push(connector.id);
	sink.inputs[inputIndex] = [connector.id];
};

/** Fix up by adding a new source */
export const fillFromSource = (producerId: NodeId, inputIndex: number) => (draft: Draft<State>) => {
	const producer = draft.producers.get(producerId)!;
	const flow = producer.inputFlows()[inputIndex];

	const shortfall = buildingInputExcess(draft, producer, inputIndex).neg();
	if (shortfall.lte(BigRat.ZERO)) {
		return;
	}

	const referencePoint = pointAdd(producer, producer.inputAttachPoints[inputIndex]);

	const source = new Source(referencePoint.x - FIXUP_SOURCE_X_OFFSET, referencePoint.y, shortfall, flow.item);
	draft.producers.set(source.id, source);
	const connector = new Connector(shortfall, flow.item, source.id, producerId, 0, inputIndex);
	draft.connectors.set(connector.id, connector);
	source.outputs[0] = [connector.id];
	producer.inputs[inputIndex].push(connector.id);
};

/** Fix up by adding a new recipe that produces this */
export const fillFromRecipe = (producerId: NodeId, inputIndex: number, recipe: Recipe) => (draft: Draft<State>) => {
	const producer = draft.producers.get(producerId)!;
	const flow = producer.inputFlows()[inputIndex];

	const shortfall = buildingInputExcess(draft, producer, inputIndex).neg();
	if (shortfall.lte(BigRat.ZERO)) {
		return;
	}

	const outputIndex = recipe.Outputs.findIndex((i) => i.Item.ClassName === flow.item.ClassName);
	const baseItemsPerSecond = recipe.Outputs[outputIndex].Quantity.div(recipe.Duration);
	const baseItemsPerMinute = baseItemsPerSecond.mul(SIXTY);
	const desiredRate = shortfall.div(baseItemsPerMinute);

	const referencePoint = pointAdd(producer, producer.inputAttachPoints[inputIndex]);

	const source = new ProductionBuilding(
		referencePoint.x - FIXUP_BUILDING_X_OFFSET,
		referencePoint.y,
		desiredRate,
		recipe
	);
	draft.producers.set(source.id, source);
	const connector = new Connector(shortfall, flow.item, source.id, producerId, outputIndex, inputIndex);
	draft.connectors.set(connector.id, connector);
	source.outputs[outputIndex] = [connector.id];
	producer.inputs[inputIndex].push(connector.id);
};

/** Fix up by adjusting Connector to match its input side */
export const adjustConnectorInput = (connectorId: NodeId) => (draft: Draft<State>) => {
	const connector = draft.connectors.get(connectorId)!;
	const producer = draft.producers.get(connector.input)!;
	const outputIndex = producer.outputs.findIndex((o) => o.includes(connectorId));

	const excess = buildingOutputExcess(draft, producer, outputIndex);
	const targetRate = connector.rate.add(excess);
	if (targetRate.lte(BigRat.ZERO)) {
		removeConnector(connectorId)(draft);
	} else {
		connector.rate = targetRate;
	}
};

/** Fix up by adjusting Connector to match its output side */
export const adjustConnectorOutput = (connectorId: NodeId) => (draft: Draft<State>) => {
	const connector = draft.connectors.get(connectorId)!;
	const producer = draft.producers.get(connector.output)!;
	const inputIndex = producer.inputs.findIndex((o) => o.includes(connectorId));

	const excess = buildingInputExcess(draft, producer, inputIndex);
	const targetRate = connector.rate.sub(excess);
	if (targetRate.lte(BigRat.ZERO)) {
		removeConnector(connectorId)(draft);
	} else {
		connector.rate = targetRate;
	}
};

// export const splitProducer = (id: NodeId, leftRate: BigRat) => (draft: Draft<State>) => {
// 	const left = draft.producers.get(id)!
// 	const right = left.clone()
// }
