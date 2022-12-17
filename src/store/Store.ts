import { Draft } from "immer";
import { BigRat } from "../math/BigRat";
import { Flow, NodeId, Point } from "./Common";
import { Connector } from "./Connectors";
import { makeStore, Selector } from "./MakeStore";
import { Producer, Sink, Source } from "./Producers";

export type MouseOverInfo =
	| { type: "none" }
	| { type: "viewport" }
	| {
			type: "producer";
			producerId: NodeId;
	  }
	| { type: "producer:connection:input" | "producer:connection:output"; producerId: NodeId; index: number };

export interface State {
	viewport: {
		center: Point;
		zoom: number;
	};
	mouseOver: MouseOverInfo;
	producers: Map<NodeId, Producer>;
	connectors: Map<NodeId, Connector>;
}

const initialState: State = {
	viewport: {
		center: { x: 0, y: 0 },
		zoom: 1,
	},
	mouseOver: { type: "none" },
	producers: new Map(),
	connectors: new Map(),
};

const { useSelector, update, getStateRaw } = makeStore(initialState, "_MainStore");
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
			connectors: Connector[];
			flow: Flow;
	  };

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
				connectors: producer.inputs[mouseOver.index].map((id) => state.connectors.get(id)!),
				flow: producer.inputFlows()[mouseOver.index],
			};
		}
		case "producer:connection:output": {
			const producer = state.producers.get(mouseOver.producerId)!;
			return {
				type,
				producer,
				connectors: producer.outputs[mouseOver.index].map((id) => state.connectors.get(id)!),
				flow: producer.outputFlows()[mouseOver.index],
			};
		}
	}
}
