import { Items } from "../../../data/generated/items";
import { Recipes } from "../../../data/generated/recipes";
import { Item, Recipe } from "../../../data/types";
import {
	bitsNeeded,
	makeWMap,
	mapBits,
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
	writeBigPos(w, BigInt(writePId.size));
	const writeBId = makeWMap(state.buses.keys());
	writeBigPos(w, BigInt(writeBId.size));
	function writePIdOrBIdWithIndex(
		connectorId: NodeId,
		busOrProducerId: NodeId,
		index: number,
		connectorOutput: boolean
	) {
		const bus = state.buses.get(busOrProducerId);
		if (bus) {
			w.write(1, 1);
			writeBId(w, busOrProducerId);
			const terms = connectorOutput ? bus.inputs : bus.outputs;
			const term = terms.find((t) => t.id === connectorId);
			if (!term) {
				throw new Error("Internal serializer failure: Bus id");
			}
			saveX(w, term.x);
		} else {
			w.write(1, 0);
			writePId(w, busOrProducerId);
			w.write(2, index);
		}
	}

	for (const c of state.connectors.values()) {
		if (c.rate.eq(BigRat.ZERO)) {
			throw new Error();
		}
		writeBigRat(w, c.rate);
		writeItem(w, c.item);
		writePIdOrBIdWithIndex(c.id, c.input, c.inputIndex, false);
		writePIdOrBIdWithIndex(c.id, c.output, c.outputIndex, true);
	}
	writeBigRat(w, BigRat.ZERO);

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

	for (const b of state.buses.values()) {
		saveX(w, b.x1);
		saveX(w, b.x2);
		saveY(w, b.y);
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

	const producerCount = Number(readBigPos(r));
	const busCount = Number(readBigPos(r));
	const P_BITS = mapBits(producerCount);
	const B_BITS = mapBits(busCount);

	const producers: Producer[] = [];
	const buses: Bus[] = [];

	type TempConnectorConnection =
		| {
				type: "producer";
				id: number;
				index: number;
		  }
		| {
				type: "bus";
				id: number;
				x: number;
		  };

	const tempConnectors: {
		rate: BigRat;
		item: Item;
		input: TempConnectorConnection;
		output: TempConnectorConnection;
	}[] = [];

	while (true) {
		const rate = readBigRat(r);
		if (rate.eq(BigRat.ZERO)) {
			break;
		}
		if (rate.lt(BigRat.ZERO)) {
			console.warn(`Decode: negative rate`);
			return null;
		}
		const item = readItem(r);
		if (!item) {
			console.warn(`Decode: missing item`);
			return null;
		}

		const tccs: TempConnectorConnection[] = [];
		for (let i = 0; i < 2; i++) {
			const isBus = !!r.read(1);
			if (isBus) {
				const id = r.read(B_BITS);
				const x = loadX(r);
				tccs.push({
					type: "bus",
					id,
					x,
				});
			} else {
				const id = r.read(P_BITS);
				const index = r.read(2);
				tccs.push({ type: "producer", id, index });
			}
		}

		tempConnectors.push({
			rate,
			item,
			input: tccs[0],
			output: tccs[1],
		});
	}

	for (let i = 0; i < producerCount; i++) {
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

	for (let i = 0; i < busCount; i++) {
		const x1 = loadX(r);
		const x2 = loadX(r);
		const y = loadY(r);
		buses.push(new Bus(x1, x2, y));
	}

	const connectors: Connector[] = [];
	for (const temp of tempConnectors) {
		const inputp = temp.input.type === "producer" ? producers[temp.input.id] : buses[temp.input.id];
		const outputp = temp.output.type === "producer" ? producers[temp.output.id] : buses[temp.output.id];
		const inputIndex = temp.input.type === "producer" ? temp.input.index : temp.input.x;
		const outputIndex = temp.output.type === "producer" ? temp.output.index : temp.output.x;
		if (!inputp || !outputp) {
			console.warn(`Decode: bad producer/bus ref`);
			return null;
		}
		connectors.push(new Connector(temp.rate, temp.item, inputp.id, outputp.id, inputIndex, outputIndex));
	}

	state.connectors = new Map(connectors.map((c) => [c.id, c]));
	state.producers = new Map(producers.map((p) => [p.id, p]));
	state.buses = new Map(buses.map((b) => [b.id, b]));

	for (const c of connectors) {
		const pout = state.producers.get(c.output);
		if (pout) {
			if (pout.inputFlows()[c.outputIndex].item !== c.item) {
				console.warn(
					`Decode: Connection item mismatch ${pout.inputFlows()[c.outputIndex].item.ClassName} !== ${
						c.item.ClassName
					}`
				);
				return null;
			}
			pout.inputs[c.outputIndex].push(c.id);
		} else {
			const bout = state.buses.get(c.output)!;
			if (c.item.IsPiped) {
				console.warn(`Decode: Connection item mismatch (bus) ${c.item.ClassName}`);
				return null;
			}
			bout.inputs.push({ x: c.outputIndex, id: c.id });
		}
		const pin = state.producers.get(c.input);
		if (pin) {
			if (pin.outputFlows()[c.inputIndex].item !== c.item) {
				console.warn(
					`Decode: Connection item mismatch ${pin.outputFlows()[c.inputIndex].item.ClassName} !== ${
						c.item.ClassName
					}`
				);
				return null;
			}
			pin.outputs[c.inputIndex].push(c.id);
		} else {
			const bin = state.buses.get(c.input)!;
			if (c.item.IsPiped) {
				console.warn(`Decode: Connection item mismatch (bus) ${c.item.ClassName}`);
				return null;
			}
			bin.outputs.push({ x: c.inputIndex, id: c.id });
		}
	}

	for (const b of buses) {
		let i: number;
		b.inputs.sort(compareTerminals);
		i = 0;
		for (const { id } of b.inputs) {
			state.connectors.get(id)!.outputIndex = i++;
		}
		i = 0;
		b.outputs.sort(compareTerminals);
		for (const { id } of b.outputs) {
			state.connectors.get(id)!.inputIndex = i++;
		}
	}

	return state;
}
