import { useEffect } from "preact/hooks";
import { setEncodedDataForTab, TAB_PLANNER } from "../base64";
import { serialize } from "./store/Serializer";
import { State, useSelector } from "./store/Store";

const identity = <T extends any>(x: T) => x;

export function SerializePlanner() {
	const state = useSelector<State>(identity);
	useEffect(() => {
		const handle = requestIdleCallback(() => {
			setEncodedDataForTab(TAB_PLANNER, serialize(state));
		});
		return () => cancelIdleCallback(handle);
	});
	return null;
}
