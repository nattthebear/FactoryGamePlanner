import { Draft } from "immer";
import { BigRat } from "../math/BigRat";
import { NodeId, Point } from "./Common";
import { Connector } from "./Connectors";
import { makeStore, Selector } from "./MakeStore";
import { Producer, Sink, Source } from "./Producers";

export interface State {
	viewport: {
		center: Point;
		zoom: number;
	};
	producers: Map<NodeId, Producer>;
	connectors: Map<NodeId, Connector>;
}

const initialState: State = {
	viewport: {
		center: { x: 0, y: 0 },
		zoom: 1,
	},
	producers: new Map(),
	connectors: new Map(),
};

const { useSelector, update } = makeStore(initialState, "_MainStore");
export { useSelector, update };

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
