import { useEffect, useRef } from "preact/hooks";

export function useLatestValue<T>(value: T) {
	const ref = useRef(value);
	useEffect(() => {
		ref.current = value;
	});
	return ref;
}
