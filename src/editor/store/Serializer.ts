import type { Item, Recipe } from "../../../data/types";
import {
	bitsNeeded,
	makeReadItem,
	makeReadRecipe,
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
import { FACTORY_MAX, FACTORY_MIN, filterNulls } from "../../util";
import { Bus, BusTerminal } from "./Bus";
import { Connector } from "./Connectors";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { reflowConnectors } from "./ReflowConnector";
import { makeEmptyState, State } from "./Store";

const VERSION = 3;

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
		saveX(w, b.x);
		saveY(w, b.y);
		const { terminals } = b;
		writeBigPos(w, BigInt(terminals.length));

		let dx = 0;
		for (let i = 0; i < terminals.length; i++) {
			const v1 = terminals[i].rxIn - dx;
			if (v1 < 0) {
				throw new Error("WOW");
			}
			const v2 = terminals[i].rxOut - dx - v1;
			writeBigPos(w, BigInt(v1 >>> 0));
			writeBigPos(w, BigInt(v2 >>> 0));
			writeCId(w, terminals[i].id);
			dx += v1;
		}
		writeBigPos(w, BigInt((b.width - dx) >>> 0));
	}

	return w.finish();
}

export function deserialize(encoded: string) {
	const r = new RStream(encoded);

	const version = r.read(6);

	let vReadItem: typeof readItem;
	let vReadRecipe: typeof readRecipe;

	switch (version) {
		case 0:
			vReadItem = makeReadItem(116);
			vReadRecipe = makeReadRecipe(203);
			break;
		case 1:
			vReadItem = makeReadItem(139);
			vReadRecipe = makeReadRecipe(275);
			break;
		case 2:
			vReadItem = makeReadItem(140);
			vReadRecipe = makeReadRecipe(277);
			break;
		case 3:
			vReadItem = makeReadItem(141);
			vReadRecipe = makeReadRecipe(278);
			break;
		default:
			console.warn(`Decode: unknown version ${version}`);
			return null;
	}

	const state = makeEmptyState();

	const P_BITS = Number(readBigPos(r));
	const C_BITS = Number(readBigPos(r));

	const producers: (Producer | null)[] = [];

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
			recipe = vReadRecipe(r);
		} else {
			item = vReadItem(r);
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
				producers.push(null);
				continue;
			}
			producer = new ProductionBuilding(x, y, rate, recipe);
		} else if (type === 1) {
			if (!item) {
				console.warn(`Decode: missing item`);
				producers.push(null);
				continue;
			}
			producer = new Sink(x, y, rate, item);
		} else if (type === 2) {
			if (!item) {
				console.warn(`Decode: missing item`);
				producers.push(null);
				continue;
			}
			producer = new Source(x, y, rate, item);
		} else {
			console.warn(`Decode: internal error`);
			return null;
		}
		producers.push(producer);
	}

	const connectors: (Connector | null)[] = [];
	for (const temp of tempConnectors) {
		const inputp = producers[temp.inId];
		const outputp = producers[temp.outId];
		if (!inputp || !outputp) {
			console.warn(`Decode: bad producer ref`);
			connectors.push(null);
			continue;
		}
		const inputItem = inputp.outputFlows()[temp.inputIndex].item;
		const outputItem = outputp.inputFlows()[temp.outputIndex].item;
		if (inputItem !== outputItem) {
			console.warn(`Decode: Connection item mismatch ${inputItem.ClassName} !== ${outputItem.ClassName}`);
			connectors.push(null);
			continue;
		}
		const c = new Connector(BigRat.ZERO, inputItem, inputp.id, outputp.id, temp.inputIndex, temp.outputIndex);
		connectors.push(c);
		inputp.outputs[c.inputIndex].push(c.id);
		outputp.inputs[c.outputIndex].push(c.id);
	}

	const buses: Bus[] = [];
	const busCount = Number(readBigPos(r));
	for (let i = 0; i < busCount; i++) {
		const x = loadX(r);
		const y = loadY(r);

		const terminalCount = Number(readBigPos(r));
		let dx = 0;
		const terminals: BusTerminal[] = [];

		for (let j = 0; j < terminalCount; j++) {
			const v1 = Number(readBigPos(r));
			const v2 = Number(readBigPos(r));
			const connectorIndex = r.read(C_BITS);
			const connector = connectors[connectorIndex];
			if (connector) {
				terminals.push({
					rxIn: dx + v1,
					rxOut: dx + v1 + v2,
					id: connector.id,
				});
			}
			dx += v1;
		}

		const width = dx + Number(readBigPos(r));
		const bus = new Bus(x, y, width);
		bus.terminals = terminals;
		buses.push(bus);
	}

	state.connectors = new Map(filterNulls(connectors).map((c) => [c.id, c]));
	state.producers = new Map(filterNulls(producers).map((p) => [p.id, p]));
	state.buses = new Map(buses.map((b) => [b.id, b]));
	reflowConnectors(state, state.connectors.keys());

	return state;
}
