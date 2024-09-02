import { LayerInstance, scheduleUpdate, cleanup } from "vdomk";
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

	function replace(newState: S) {
		state = newState;
		for (const sub of subs) {
			sub();
		}
	}

	const ret = {
		useSelector<V>(instance: LayerInstance, selector: Selector<S, V>) {
			const equal = typeof selector === "function" ? Object.is : selector.equal;
			const select = typeof selector === "function" ? selector : selector.select;

			let selected = select(state);

			function subscription() {
				let newSelected: V;
				try {
					newSelected = select(state);
				} catch {
					// This can be hit in various scenarios when removing components.
					// https://react-redux.js.org/api/hooks#stale-props-and-zombie-children
					scheduleUpdate(instance);
					return;
				}
				if (!equal(newSelected, selected)) {
					scheduleUpdate(instance);
				}
			}

			subs.add(subscription);
			cleanup(instance, () => subs.delete(subscription));

			return () => {
				const newSelected = select(state);
				if (!equal(newSelected, selected)) {
					selected = newSelected;
				}
				return selected;
			};
		},
		replace,
		update(action: (draft: Draft<S>) => void) {
			replace(produce(state, action));
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
