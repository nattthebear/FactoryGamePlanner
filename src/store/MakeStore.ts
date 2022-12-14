import { useEffect, useReducer, useRef } from "preact/hooks";
import produce, { Draft } from "immer";

export function makeStore<S>(initialValue: S) {
	let state = initialValue;
	const subs = new Set<() => void>();

	return {
		useSelector<V>(selector: (state: S) => V) {
			const updateSignal = useReducer<number, void>((i) => i + 1, 0)[1];
			const selected = selector(state);
			const refValue = { selector, selected };
			const ref = useRef(refValue);
			ref.current = refValue;

			useEffect(() => {
				function subscription() {
					const newSelected = ref.current.selector(state);
					if (!Object.is(newSelected, ref.current.selected)) {
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
	};
}
