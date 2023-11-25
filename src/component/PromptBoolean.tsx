import { LayerInstance, VNode, effect } from "vdomk";
import { prompt } from "./Prompt";

function PromptBoolean(
	{ message, onConfirm }: { message: VNode; onConfirm: (value: boolean) => void },
	instance: LayerInstance,
) {
	let okButtonElt: HTMLButtonElement | null = null;
	const ref = (value: HTMLButtonElement | null) => (okButtonElt = value);
	effect(instance, () => okButtonElt?.focus());

	return (
		<div>
			<div>{message}</div>
			<div class="dialog-buttons">
				<button onClick={() => onConfirm(false)}>Cancel</button>
				<button ref={ref} onClick={() => onConfirm(true)}>
					Ok
				</button>
			</div>
		</div>
	);
}

export const promptBoolean = async ({ title, message }: { title: string; message: VNode }) =>
	!!(await prompt<boolean>({
		title,
		render: (onConfirm) => <PromptBoolean message={message} onConfirm={onConfirm} />,
	}));
