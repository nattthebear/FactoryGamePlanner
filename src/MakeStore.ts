import { useEffect, useReducer, useRef } from "preact/hooks";
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

			const updateSignal = useReducer<number, void>((i) => i + 1, 0)[1];
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
						updateSignal();
						return;
					}
					if (!equal(newSelected, ref.current!.selected)) {
						updateSignal();
					}
				}
				subs.add(subscription);
				return () => {
					subs.delete(updateSignal);
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
	};

	if (debugName) {
		window[debugName as any] = state as any;
		subs.add(() => {
			window[debugName as any] = state as any;
		});
	}

	return ret;
}
