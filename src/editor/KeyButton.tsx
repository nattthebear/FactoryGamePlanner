import { TPC, cleanup } from "vdomk";
import { isAnyPromptActive } from "../component/Prompt";

import "./KeyButton.css";

interface Props {
	keyName: string;
	onAct: (wasClick: boolean) => void;
	disabled?: boolean;
	children: string;
}

export const KeyButton: TPC<Props> = (props, instance) => {
	const listener = (ev: KeyboardEvent) => {
		if (!props.disabled && !isAnyPromptActive() && ev.key === props.keyName) {
			props.onAct(false);
		}
	};
	document.addEventListener("keypress", listener, { passive: true });
	cleanup(instance, () => document.removeEventListener("keypress", listener));

	return (nextProps) => {
		props = nextProps;

		return (
			<button disabled={props.disabled} onClick={() => !isAnyPromptActive() && props.onAct(true)}>
				{props.keyName}: {props.children}
			</button>
		);
	};
};
