import { useReducer } from "preact/hooks";

export function useStateWithPrev<T>(initialValue: T): [T, (newValue: T) => void, T | null] {
	const [{ oldValue, value }, changeValue] = useReducer<{ oldValue: T | null; value: T }, T>(
		({ oldValue, value }, newValue) => ({
			oldValue: value,
			value: newValue,
		}),
		{ oldValue: null, value: initialValue },
	);
	return [value, changeValue, oldValue];
}
