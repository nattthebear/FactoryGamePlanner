import { Draft } from "../../immer";
import { BigRat } from "../../math/BigRat";
import { Flow, Point } from "../../util";
import { NodeId, pointEqual } from "./Common";
import { Connector } from "./Connectors";
import { makeStore, makeStoreWithHashRouter, ROUTER_EDITOR_STORE, Selector } from "../../MakeStore";
import { Producer, Sink, Source } from "./Producers";
import { deserialize, serialize } from "./Serializer";
import { Item } from "../../../data/types";
import { Bus } from "./Bus";

export type MouseOverInfo =
	| { type: "none" }
	| { type: "viewport" }
	| {
			type: "producer";
			producerId: NodeId;
	  }
	| { type: "producer:connection:input" | "producer:connection:output"; producerId: NodeId; index: number }
	| { type: "connector"; connectorId: NodeId }
	| { type: "bus"; busId: NodeId };

export type WipInfo =
	| { type: "none" }
	| { type: "connector:input"; producerId: NodeId; index: number; item: Item }
	| { type: "connector:output"; producerId: NodeId; index: number; item: Item }
	| { type: "producer:merge"; producerId: NodeId }
	| { type: "connector:bus"; connectorId: NodeId }
	| { type: "bus:connector"; busId: NodeId };

export interface State {
	viewport: {
		center: Point;
		zoom: number;
	};
	mouseOver: MouseOverInfo;
	wip: WipInfo;
	producers: Map<NodeId, Producer>;
	connectors: Map<NodeId, Connector>;
	buses: Map<NodeId, Bus>;
}

const initialMouseOver: MouseOverInfo = { type: "none" };

export const makeEmptyState = (): State => ({
	viewport: {
		center: { x: 0, y: 0 },
		zoom: 1,
	},
	mouseOver: initialMouseOver,
	wip: { type: "none" },
	producers: new Map(),
	connectors: new Map(),
	buses: new Map(),
});

const { useSelector, update, getStateRaw } = makeStoreWithHashRouter(
	{ serialize, deserialize, makeDefault: makeEmptyState },
	ROUTER_EDITOR_STORE,
	"_EditorStore",
);
export { useSelector, update, getStateRaw };

document.documentElement.addEventListener(
	"mouseleave",
	() => {
		update((draft) => {
			draft.mouseOver = initialMouseOver;
		});
	},
	{ passive: true },
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
export const selectBusIds: Selector<State, NodeId[]> = {
	select: (state) => [...state.buses.keys()],
	equal: arrayEqual,
};

export const selectProducerLocation = (id: NodeId): Selector<State, Point> => ({
	select: (state) => {
		const p = state.producers.get(id)!;
		return { x: p.x, y: p.y };
	},
	equal: pointEqual,
});

interface ConnectorBusTerminal {
	in: Point;
	out: Point;
}
function cbtEqual(a: ConnectorBusTerminal | null, b: ConnectorBusTerminal | null) {
	if (!a) {
		return !b;
	}
	if (!b) {
		return false;
	}
	return pointEqual(a.in, b.in) && pointEqual(a.out, b.out);
}
export const selectConnectorBusTerminal = (id: NodeId): Selector<State, ConnectorBusTerminal | null> => ({
	select: (state) => {
		// todo: speed this up
		for (const bus of state.buses.values()) {
			const t = bus.terminals.find((t) => t.id === id);
			if (t) {
				const xShift = bus.width * 0.5;
				return {
					in: {
						x: bus.x + t.rxIn - xShift,
						y: bus.y,
					},
					out: { x: bus.x + t.rxOut - xShift, y: bus.y },
				};
			}
		}
		return null;
	},
	equal: cbtEqual,
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
	| { type: "connector"; connector: Connector; bus: Bus | undefined }
	| { type: "bus"; bus: Bus };

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

			// todo: speed this up
			let foundBus = undefined;
			for (const bus of state.buses.values()) {
				const t = bus.terminals.find((t) => t.id === connector.id);
				if (t) {
					foundBus = bus;
					break;
				}
			}

			return {
				type,
				connector,
				bus: foundBus,
			};
		}
		case "bus": {
			const bus = state.buses.get(mouseOver.busId)!;
			return { type, bus };
		}
	}
}
