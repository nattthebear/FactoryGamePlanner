import { useEffect } from "preact/hooks";
import { isAnyPromptActive } from "../component/Prompt";
import { useLatestValue } from "../hook/useLatestValue";

interface Props {
	keyName: string;
	onAct: (wasClick: boolean) => void;
	disabled?: boolean;
	children: string;
}

export function KeyButton(props: Props) {
	const propsLatest = useLatestValue(props);

	useEffect(() => {
		const listener = (ev: KeyboardEvent) => {
			if (!propsLatest.current.disabled && !isAnyPromptActive() && ev.key === propsLatest.current.keyName) {
				propsLatest.current.onAct(false);
			}
		};
		document.addEventListener("keypress", listener, { passive: true });
		return () => document.removeEventListener("keypress", listener);
	}, []);

	return (
		<button disabled={props.disabled} onClick={() => props.onAct(true)}>
			{props.keyName}: {props.children}
		</button>
	);
}
