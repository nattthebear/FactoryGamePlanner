import { useEffect, useRef } from "preact/hooks";
import { setEncodedDataForTab, TAB_EDITOR } from "../base64";
import { deserialize, serialize } from "./store/Serializer";
import { State, useSelector } from "./store/Store";

const identity = <T extends any>(x: T) => x;

export function SerializeEditor() {
	const state = useSelector<State>(identity);
	useEffect(() => {
		const handle = requestIdleCallback(() => {
			setEncodedDataForTab(TAB_EDITOR, serialize(state));
		});
		return () => cancelIdleCallback(handle);
	});
	return null;
}
