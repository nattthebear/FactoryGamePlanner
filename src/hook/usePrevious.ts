import { useEffect, useRef } from "preact/hooks";

export function usePrevious<T>(value: T) {
	const ref = useRef<T | undefined>();

	useEffect(() => {
		ref.current = value;
	}, [value]); // Only re-run if value changes

	return ref.current;
}
