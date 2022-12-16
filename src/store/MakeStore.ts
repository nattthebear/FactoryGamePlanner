import { useEffect, useReducer, useRef } from "preact/hooks";
import produce, { Draft } from "immer";

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
			const updateSignal = useReducer<number, void>((i) => i + 1, 0)[1];
			const select = typeof selector === "function" ? selector : selector.select;

			const selected = select(state);
			const refValue = { select, selected };
			const ref = useRef(refValue);
			ref.current = refValue;

			useEffect(() => {
				const equal = typeof selector === "function" ? Object.is : selector.equal;
				function subscription() {
					const newSelected = ref.current.select(state);
					if (!equal(newSelected, ref.current.selected)) {
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
		subs.add(() => {
			window[debugName as any] = state as any;
		});
	}

	return ret;
}
