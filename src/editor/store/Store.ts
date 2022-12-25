import { Draft } from "../../immer";
import { BigRat } from "../../math/BigRat";
import { Flow, Point } from "../../util";
import { NodeId, pointEqual } from "./Common";
import { Connector } from "./Connectors";
import { makeStore, Selector } from "../../MakeStore";
import { Producer, Sink, Source } from "./Producers";
import { deserialize } from "./Serializer";
import { getEncodedDataForTab, TAB_EDITOR } from "../../base64";
import { Item } from "../../../data/types";

export type MouseOverInfo =
	| { type: "none" }
	| { type: "viewport" }
	| {
			type: "producer";
			producerId: NodeId;
	  }
	| { type: "producer:connection:input" | "producer:connection:output"; producerId: NodeId; index: number }
	| { type: "connector"; connectorId: NodeId };

export type WipInfo =
	| { type: "none" }
	| { type: "connector:input"; producerId: NodeId; index: number; item: Item }
	| { type: "connector:output"; producerId: NodeId; index: number; item: Item }
	| { type: "producer:merge"; producerId: NodeId };

export interface State {
	viewport: {
		center: Point;
		zoom: number;
	};
	mouseOver: MouseOverInfo;
	wip: WipInfo;
	producers: Map<NodeId, Producer>;
	connectors: Map<NodeId, Connector>;
}

export const makeEmptyState = (): State => ({
	viewport: {
		center: { x: 0, y: 0 },
		zoom: 1,
	},
	mouseOver: { type: "none" },
	wip: { type: "none" },
	producers: new Map(),
	connectors: new Map(),
});
const initialState = (() => {
	const search = getEncodedDataForTab(TAB_EDITOR);
	if (search) {
		try {
			const reconstructed = deserialize(search);
			if (reconstructed) {
				return reconstructed;
			}
		} catch (e) {
			console.error(e);
		}
	}
	return makeEmptyState();
})();

const { useSelector, update, getStateRaw } = makeStore(initialState, "_EditorStore");
export { useSelector, update, getStateRaw };

document.documentElement.addEventListener(
	"mouseleave",
	() => {
		update((draft) => {
			draft.mouseOver = initialState.mouseOver;
		});
	},
	{ passive: true }
);

function arrayEqual<T>(x: T[], y: T[]) {
	if (x.length !== y.length) {
		return false;
	}
	for (let i = 0; i < x.length; i++) {
		if (x[i] !== y[i]) {
			return false;
		}
	}
	return true;
}

export const selectProducerIds: Selector<State, NodeId[]> = {
	select: (state) => [...state.producers.keys()],
	equal: arrayEqual,
};
export const selectConnectorIds: Selector<State, NodeId[]> = {
	select: (state) => [...state.connectors.keys()],
	equal: arrayEqual,
};

export const selectProducerLocation = (id: NodeId): Selector<State, Point> => ({
	select: (state) => {
		const p = state.producers.get(id)!;
		return { x: p.x, y: p.y };
	},
	equal: pointEqual,
});

export type MouseOverObject =
	| { type: "none" }
	| { type: "viewport" }
	| {
			type: "producer";
			producer: Producer;
	  }
	| {
			type: "producer:connection:input" | "producer:connection:output";
			producer: Producer;
			index: number;
			connectors: Connector[];
			flow: Flow;
	  }
	| { type: "connector"; connector: Connector };

export function selectMouseOverObject(state: State): MouseOverObject {
	const { mouseOver } = state;
	const { type } = mouseOver;
	switch (type) {
		case "none":
			return { type };
		case "viewport":
			return { type };
		case "producer":
			return { type, producer: state.producers.get(mouseOver.producerId)! };
		case "producer:connection:input": {
			const producer = state.producers.get(mouseOver.producerId)!;
			return {
				type,
				producer,
				index: mouseOver.index,
				connectors: producer.inputs[mouseOver.index].map((id) => state.connectors.get(id)!),
				flow: producer.inputFlows()[mouseOver.index],
			};
		}
		case "producer:connection:output": {
			const producer = state.producers.get(mouseOver.producerId)!;
			return {
				type,
				producer,
				index: mouseOver.index,
				connectors: producer.outputs[mouseOver.index].map((id) => state.connectors.get(id)!),
				flow: producer.outputFlows()[mouseOver.index],
			};
		}
		case "connector": {
			const connector = state.connectors.get(mouseOver.connectorId)!;
			return {
				type,
				connector,
			};
		}
	}
}
