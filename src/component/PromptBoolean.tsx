import { VNode } from "vdomk";
import { prompt } from "./Prompt";
import { autoFocus } from "../hook/autoFocus";

function PromptBoolean({ message, onConfirm }: { message: VNode; onConfirm: (value: boolean) => void }) {
	return (
		<div>
			<div>{message}</div>
			<div class="dialog-buttons">
				<button onClick={() => onConfirm(false)}>Cancel</button>
				<button ref={autoFocus} onClick={() => onConfirm(true)}>
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
