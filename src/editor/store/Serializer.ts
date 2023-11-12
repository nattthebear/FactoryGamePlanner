import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { Item, Recipe } from "../../../data/types";
import {
	bitsNeeded,
	makeWMap,
	readBigPos,
	readBigRat,
	readItem,
	readRecipe,
	RStream,
	writeBigPos,
	writeBigRat,
	writeItem,
	writeRecipe,
	WStream,
} from "../../base64";
import { BigRat } from "../../math/BigRat";
import { FACTORY_MAX, FACTORY_MIN } from "../../util";
import { Bus, compareTerminals } from "./Bus";
import { generateId, NodeId } from "./Common";
import { Connector } from "./Connectors";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { reflowConnectors } from "./ReflowConnector";
import { makeEmptyState, State } from "./Store";

const VERSION = 0;

const { saveX, saveY, loadX, loadY } = (() => {
	const xoffs = FACTORY_MIN.x;
	const yoffs = FACTORY_MIN.y;

	const xbits = bitsNeeded(FACTORY_MAX.x - xoffs);
	const ybits = bitsNeeded(FACTORY_MAX.y - yoffs);
	return {
		saveX(w: WStream, x: number) {
			w.write(xbits, (x - xoffs) >>> 0);
		},
		saveY(w: WStream, y: number) {
			w.write(ybits, (y - yoffs) >>> 0);
		},
		loadX(r: RStream) {
			return r.read(xbits) + xoffs;
		},
		loadY(r: RStream) {
			return r.read(ybits) + yoffs;
		},
	};
})();

export function serialize(state: State) {
	const w = new WStream();

	w.write(6, VERSION);

	const writePId = makeWMap(state.producers.keys());
	writeBigPos(w, BigInt(writePId.BITS));
	const writeCId = makeWMap(state.connectors.keys());
	writeBigPos(w, BigInt(writeCId.BITS));

	writeBigPos(w, BigInt(state.connectors.size));
	for (const c of state.connectors.values()) {
		writePId(w, c.input);
		writePId(w, c.output);
		w.write(2, c.inputIndex);
		w.write(2, c.outputIndex);
	}

	for (const p of state.producers.values()) {
		if (p instanceof ProductionBuilding) {
			w.write(2, 0);
			writeRecipe(w, p.recipe);
		} else if (p instanceof Sink) {
			w.write(2, 1);
			writeItem(w, p.item);
		} else if (p instanceof Source) {
			w.write(2, 2);
			writeItem(w, p.item);
		} else {
			throw new Error("Internal ptype error");
		}
		saveX(w, p.x);
		saveY(w, p.y);
		writeBigRat(w, p.rate);
	}
	w.write(2, 3);

	writeBigPos(w, BigInt(state.buses.size));
	for (const b of state.buses.values()) {
		let x = b.x1;
		saveX(w, x);
		saveY(w, b.y);
		const terminals = b.terminals.slice();
		terminals.sort(compareTerminals);
		for (let i = 0; i < terminals.length; i++) {
			const nextx = terminals[i].x;
			const diff = nextx - x;
			writeBigPos(w, BigInt(diff));
			x = nextx;
		}
		writeBigPos(w, BigInt(b.x2 - x));
		writeBigPos(w, 0n);

		for (const { id } of terminals) {
			writeCId(w, id);
		}
	}

	return w.finish();
}

export function deserialize(encoded: string) {
	const r = new RStream(encoded);

	const version = r.read(6);
	if (version !== VERSION) {
		console.warn(`Decode: version mismatch ${version} !== ${VERSION}`);
		return null;
	}

	const state = makeEmptyState();

	const P_BITS = Number(readBigPos(r));
	const C_BITS = Number(readBigPos(r));

	const producers: Producer[] = [];

	const tempConnectors: {
		inId: number;
		outId: number;
		inputIndex: number;
		outputIndex: number;
	}[] = [];

	const tempConnectorCount = Number(readBigPos(r));
	for (let i = 0; i < tempConnectorCount; i++) {
		const inId = r.read(P_BITS);
		const outId = r.read(P_BITS);
		const inputIndex = r.read(2);
		const outputIndex = r.read(2);
		tempConnectors.push({
			inId,
			outId,
			inputIndex,
			outputIndex,
		});
	}

	while (true) {
		const type = r.read(2);
		let recipe: Recipe | null = null;
		let item: Item | null = null;
		if (type === 3) {
			break;
		}
		if (type === 0) {
			recipe = readRecipe(r);
		} else {
			item = readItem(r);
		}
		const x = loadX(r);
		const y = loadY(r);
		const rate = readBigRat(r);
		if (rate.lte(BigRat.ZERO)) {
			console.warn(`Decode: negative or zero rate`);
			return null;
		}
		let producer: Producer;
		if (type === 0) {
			if (!recipe) {
				console.warn(`Decode: missing recipe`);
				return null;
			}
			producer = new ProductionBuilding(x, y, rate, recipe);
		} else if (type === 1) {
			if (!item) {
				console.warn(`Decode: missing item`);
				return null;
			}
			producer = new Sink(x, y, rate, item);
		} else if (type === 2) {
			if (!item) {
				console.warn(`Decode: missing item`);
				return null;
			}
			producer = new Source(x, y, rate, item);
		} else {
			console.warn(`Decode: internal error`);
			return null;
		}
		producers.push(producer);
	}

	const connectors: Connector[] = [];
	for (const temp of tempConnectors) {
		const inputp = producers[temp.inId];
		const outputp = producers[temp.outId];
		if (!inputp || !outputp) {
			console.warn(`Decode: bad producer ref`);
			return null;
		}
		const inputItem = inputp.outputFlows()[temp.inputIndex].item;
		const outputItem = outputp.inputFlows()[temp.outputIndex].item;
		if (inputItem !== outputItem) {
			console.warn(`Decode: Connection item mismatch ${inputItem.ClassName} !== ${outputItem.ClassName}`);
			return null;
		}
		const c = new Connector(BigRat.ZERO, inputItem, inputp.id, outputp.id, temp.inputIndex, temp.outputIndex);
		connectors.push(c);
		inputp.outputs[c.inputIndex].push(c.id);
		outputp.inputs[c.outputIndex].push(c.id);
	}

	const buses: Bus[] = [];
	const busCount = Number(readBigPos(r));
	for (let i = 0; i < busCount; i++) {
		let x = loadX(r);
		const y = loadY(r);
		const x1 = x;
		const terminalX: number[] = [];
		while (true) {
			const diffx = Number(readBigPos(r));
			if (diffx === 0) {
				break;
			}
			const nextX = x + diffx;
			terminalX.push(nextX);
			x = nextX;
		}
		const x2 = terminalX.pop();
		if (x2 == null) {
			console.warn(`Decode:  Bus with no x2`);
			return null;
		}

		const bus = new Bus(x1, x2, y);
		for (const x of terminalX) {
			const terminalIndex = r.read(C_BITS);
			bus.terminals.push({
				x,
				id: connectors[terminalIndex].id,
			});
		}
	}

	state.connectors = new Map(connectors.map((c) => [c.id, c]));
	state.producers = new Map(producers.map((p) => [p.id, p]));
	state.buses = new Map(buses.map((b) => [b.id, b]));
	reflowConnectors(state, state.connectors.keys());

	return state;
}
