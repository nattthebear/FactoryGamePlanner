import { makeStore } from "./MakeStore";

export interface SerializableState<S> {
	serialize(state: S): string;
	deserialize(serialized: string): S | null;
	makeDefault(): S;
}

function getStateOrDefault<S>(stateDef: SerializableState<S>, hashPart: string | undefined) {
	if (hashPart) {
		try {
			const deserialized = stateDef.deserialize(hashPart);
			if (deserialized != null) {
				return deserialized;
			}
		} catch (e) {
			console.error(e);
		}
	}
	return stateDef.makeDefault();
}

export const ROUTER_APP_STORE = 0;
export const ROUTER_PLANNER_STORE = 1;
export const ROUTER_EDITOR_STORE = 2;

const stores: (
	| {
			stateDef: SerializableState<any>;
			dirty: boolean;
			getStateRaw: () => any;
			replaceState: (newValue: any) => void;
	  }
	| undefined
)[] = [];

let lastSentHash = "";
let timeoutHandle = -1;

addEventListener("hashchange", () => {
	let { hash } = window.location;
	if (hash[0] === "#") {
		hash = hash.slice(1);
	}
	if (hash === lastSentHash) {
		return;
	}
	console.log("Loading new hash...");

	const parts = hash.split(".");
	for (let i = 0; i < stores.length; i++) {
		const store = stores[i];
		if (store) {
			const part = parts[i];
			const newState = getStateOrDefault(store.stateDef, part);
			store.replaceState(newState);
			store.dirty = false;
		}
	}

	clearTimeout(timeoutHandle);
	lastSentHash = hash;
});

const DELAY_MS = 50;

function makeDirty(index: number) {
	clearTimeout(timeoutHandle);
	stores[index]!.dirty = true;

	timeoutHandle = setTimeout(() => {
		const parts = lastSentHash.split(".");
		for (let i = 0; i < stores.length; i++) {
			const store = stores[i];
			if (store?.dirty) {
				parts[i] = store.stateDef.serialize(store.getStateRaw());
				store.dirty = false;
			}
		}

		const newHash = parts.join(".");
		if (newHash !== lastSentHash) {
			lastSentHash = newHash;
			window.location.hash = newHash;
		}
	}, DELAY_MS) as any as number;
}

export function makeStoreWithHashRouter<S>(stateDef: SerializableState<S>, hashIndex: number, debugName?: string) {
	const initialState = (() => {
		let { hash } = window.location;
		if (hash[0] === "#") {
			hash = hash.slice(1);
		}
		const parts = hash.split(".");
		const part = parts[hashIndex];
		return getStateOrDefault(stateDef, part);
	})();

	const store = makeStore(initialState, debugName);
	stores[hashIndex] = {
		stateDef,
		dirty: false,
		getStateRaw: store.getStateRaw,
		replaceState: store.replace,
	};

	store.subscribeRaw(() => {
		makeDirty(hashIndex);
	});

	makeDirty(hashIndex);
	return store;
}
