import "../../../test/test-setup";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { produce, Draft } from "../../immer";

import { serialize, deserialize } from "./Serializer";
import { makeEmptyState, State } from "./Store";
import { Producer, ProductionBuilding, Sink, Source } from "./Producers";
import { BigRat } from "../../math/BigRat";
import { Recipes } from "../../../data/generated/recipes";
import { addProducer, emptyToSink } from "./Actions";
import { Connector } from "./Connectors";
import { Bus } from "./Bus";

function assertConnectorEqual(a: Connector, b: Connector) {
	assert(a.rate.eq(b.rate));
	assert.strictEqual(a.item, b.item);
	assert.equal(a.inputIndex, b.inputIndex);
	assert.equal(a.outputIndex, b.outputIndex);
}

function assertProducerEqual(a: Producer, b: Producer) {
	// The UI can produce fractional values in x,y which are not saved, but the tests don't exercise that
	// If we change how coords are saved, we might need to change this
	assert.equal(a.x, b.x);
	assert.equal(a.y, b.y);
	assert(a.rate.eq(b.rate));
	if (a instanceof ProductionBuilding) {
		if (!(b instanceof ProductionBuilding)) {
			assert.fail("Mismatching types");
		}
		assert.strictEqual(a.recipe, b.recipe);
	} else if (a instanceof Sink) {
		if (!(b instanceof Sink)) {
			assert.fail("Mismatching types");
		}
		assert.strictEqual(a.item, b.item);
	} else if (a instanceof Source) {
		if (!(b instanceof Source)) {
			assert.fail("Mismatching types");
		}
		assert.strictEqual(a.item, b.item);
	}
}

function assertBusEqual(a: Bus, b: Bus) {
	assert.equal(a.x, b.x);
	assert.equal(a.y, b.y);
	assert.equal(a.width, b.width);
	assert.equal(a.terminals.length, b.terminals.length);
}

function assertMapEqual<V>(a: Map<any, V>, b: Map<any, V>, assertElementEqual: (a: V, b: V) => void) {
	// Ids will be different.
	// We always serialize in order and deserialize in order, so we can compare pairwise here
	assert.equal(a.size, b.size, "Length mismatch");
	const ita = a.values();
	const itb = b.values();
	while (true) {
		const va = ita.next();
		const vb = itb.next();
		if (va.done && vb.done) {
			return;
		}
		if (va.done || vb.done) {
			assert.fail("Length mismatch");
		}
		assertElementEqual(va.value, vb.value);
	}
}

function assertStateEqual(a: State, b: State) {
	assertMapEqual(a.connectors, b.connectors, assertConnectorEqual);
	assertMapEqual(a.producers, b.producers, assertProducerEqual);
	assertMapEqual(a.buses, b.buses, assertBusEqual);
}

describe("serialize + deserialize", () => {
	const dit = (name: string, callback: (draft: Draft<State>) => void) =>
		it(name, () => {
			const s = makeEmptyState();
			const t = produce(s, callback);
			const u = deserialize(serialize(t));
			if (!u) {
				assert.fail("Deserialization failed");
			}
			assertStateEqual(u, t);
		});
	dit("basic test", (draft) => {
		addProducer(new ProductionBuilding(1000, 300, BigRat.fromIntegers(7, 2), Recipes[50]))(draft);
	});
	dit("basic test 2", (draft) => {
		const p = new ProductionBuilding(49, 96, BigRat.fromIntegers(20, 1), Recipes[2]);
		addProducer(p)(draft);
		emptyToSink(p.id, 0)(draft);
	});
});
