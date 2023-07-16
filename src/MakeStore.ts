import { useEffect, useRef } from "preact/hooks";
import { useForceUpdate } from "./hook/useForceUpdate";
import { produce, Draft } from "./immer";

export type BasicSelector<S, V> = (state: S) => V;
export interface SelectorEq<S, V> {
	select: (state: S) => V;
	equal: (x: V, y: V) => boolean;
}

export type Selector<S, V> = BasicSelector<S, V> | SelectorEq<S, V>;

export function makeStore<S>(initialValue: S, debugName?: string) {
	let state = initialValue;
	const subs = new Set<() => void>();

	const ret = {
		useSelector<V>(selector: Selector<S, V>) {
			const equal = typeof selector === "function" ? Object.is : selector.equal;
			const select = typeof selector === "function" ? selector : selector.select;

			const forceUpdate = useForceUpdate();
			const ref = useRef<{ select: BasicSelector<S, V>; selected: V }>();
			const newSelected = select(state);
			const oldSelected = ref.current?.selected;
			const selected = ref.current && equal(newSelected, oldSelected) ? oldSelected! : newSelected;

			ref.current = { select, selected };

			useEffect(() => {
				function subscription() {
					let newSelected: V;
					try {
						newSelected = ref.current!.select(state);
					} catch {
						// This can be hit in various scenarios when removing components.
						// https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
						forceUpdate();
						return;
					}
					if (!equal(newSelected, ref.current!.selected)) {
						forceUpdate();
					}
				}
				subs.add(subscription);
				return () => {
					subs.delete(forceUpdate);
				};
			}, []);
			return selected;
		},
		update(action: (draft: Draft<S>) => void) {
			state = produce(state, action);
			for (const sub of subs) {
				sub();
			}
		},
		getStateRaw() {
			return state;
		},
		subscribeRaw(callback: () => void) {
			subs.add(callback);
			return () => {
				subs.delete(callback);
			};
		},
	};

	if (debugName) {
		window[debugName as any] = state as any;
		subs.add(() => {
			window[debugName as any] = state as any;
		});
	}

	return ret;
}

export interface SerializableStore<S> {
	serialize(state: S): string;
	deserialize(serialized: string): S | null;
	makeDefault(): S;
}

export const ROUTER_APP_STORE = 0;
export const ROUTER_PLANNER_STORE = 1;
export const ROUTER_EDITOR_STORE = 2;

export function makeStoreWithHashRouter<S>(
	{ serialize, deserialize, makeDefault }: SerializableStore<S>,
	hashIndex: number,
	debugName?: string,
) {
	const initialState = (() => {
		let { hash } = window.location;
		if (hash[0] === "#") {
			hash = hash.slice(1);
		}
		const parts = hash.split(".");
		const part = parts[hashIndex];
		if (!part) {
			return makeDefault();
		}
		try {
			const deserialized = deserialize(part);
			if (deserialized != null) {
				return deserialized;
			}
		} catch (e) {
			console.error(e);
		}
		return makeDefault();
	})();

	const store = makeStore(initialState, debugName);
	const DELAY_MS = 50;
	const { getStateRaw } = store;
	function updateUrl() {
		let { hash } = window.location;
		if (hash[0] === "#") {
			hash = hash.slice(1);
		}
		const parts = hash.split(".");
		while (parts.length <= hashIndex) {
			parts.push("");
		}
		parts[hashIndex] = serialize(getStateRaw());
		window.location.hash = parts.join(".");
	}

	let timeoutHandle = -1;
	store.subscribeRaw(() => {
		clearTimeout(timeoutHandle);
		timeoutHandle = setTimeout(updateUrl, DELAY_MS) as any as number;
	});

	updateUrl();
	return store;
}
