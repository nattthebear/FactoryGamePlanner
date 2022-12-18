import { useEffect, useRef } from "preact/hooks";
import { deserialize, serialize } from "../store/Serializer";
import { State, useSelector } from "../store/Store";

const identity = <T extends any>(x: T) => x;

export function SerializePlan() {
	const state = useSelector<State>(identity);
	useEffect(() => {
		const handle = requestIdleCallback(() => {
			const urlBase = window.location.href.split("?")[0];
			const search = serialize(state);
			const urlSuffix = "?" + search;
			window.history.replaceState(null, "", urlBase + urlSuffix);
		});
		return () => cancelIdleCallback(handle);
	});
	return null;
}
