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
		if (ev.key !== props.keyName) {
			return;
		}
		if (props.disabled) {
			console.log(`Fail on ${props.keyName} because disabled`);
			return;
		}
		if (isAnyPromptActive()) {
			console.log(`Fail on ${props.keyName} because prompt active`);
			return;
		}
		if (ev.target !== ev.currentTarget) {
			console.log(`Fail on ${props.keyName} because target mismatch`, {
				tar: ev.target,
				curtar: ev.currentTarget,
			});
			return;
		}

		if (!props.disabled && !isAnyPromptActive() && ev.key === props.keyName && ev.target === ev.currentTarget) {
			props.onAct(false);
		}
	};
	document.body.addEventListener("keypress", listener, { passive: true });
	cleanup(instance, () => document.body.removeEventListener("keypress", listener));

	return (nextProps) => {
		props = nextProps;

		return (
			<button disabled={props.disabled} onClick={() => !isAnyPromptActive() && props.onAct(true)}>
				{props.keyName}: {props.children}
			</button>
		);
	};
};
