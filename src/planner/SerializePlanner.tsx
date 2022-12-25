import { useEffect } from "preact/hooks";
import { setEncodedDataForTab, TAB_PLANNER } from "../base64";
import { serialize } from "./store/Serializer";
import { State, useSelector } from "./store/Store";

const identity = <T extends any>(x: T) => x;

export function SerializePlanner() {
	const state = useSelector<State>(identity);
	useEffect(() => {
		const handle = setTimeout(() => {
			setEncodedDataForTab(TAB_PLANNER, serialize(state));
		}, 100);
		return () => clearTimeout(handle);
	});
	return null;
}
