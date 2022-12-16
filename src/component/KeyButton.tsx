import { useEffect, useRef } from "preact/hooks";
import { useLatestValue } from "../hook/useLatestValue";
import { isAnyPromptActive } from "./Prompt";

interface Props {
	keyName: string;
	onAct: (wasClick: boolean) => void;
	children: string;
}

export function KeyButton(props: Props) {
	const propsLatest = useLatestValue(props);

	useEffect(() => {
		const listener = (ev: KeyboardEvent) => {
			if (!isAnyPromptActive() && ev.key === propsLatest.current.keyName) {
				propsLatest.current.onAct(false);
			}
		};
		document.addEventListener("keypress", listener, { passive: true });
		return () => document.removeEventListener("keypress", listener);
	}, []);

	return (
		<button onClick={() => props.onAct(true)}>
			{props.keyName}: {props.children}
		</button>
	);
}
