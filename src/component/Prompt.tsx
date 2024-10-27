import { TPC, VNode } from "vdomk";
import { makeStore } from "../MakeStore";

import "./Prompt.css";

export interface PromptItem<T> {
	title: string;
	render: (onConfirm: (value: T) => void) => VNode;
}

interface PromptImpl {
	item: PromptItem<any>;
	resolve: (value: any) => void;
}

const { useSelector, update, getStateRaw } = makeStore<PromptImpl[]>([]);

export const PromptRoot: TPC<{}> = (_, instance) => {
	const getActivePrompt = useSelector(instance, (prompts) => prompts[0]);

	return () => {
		const activePrompt = getActivePrompt();

		if (!activePrompt) {
			return null;
		}

		function onConfirm(value: any) {
			update((prompts) => {
				prompts.shift()?.resolve(value);
			});
		}

		return (
			<div
				class="prompt-backdrop"
				onClick={(ev) => {
					if (ev.target === ev.currentTarget) {
						onConfirm(null);
					}
				}}
			>
				<div class="prompt">
					<div class="title">{activePrompt.item.title}</div>
					{activePrompt.item.render(onConfirm)}
				</div>
			</div>
		);
	};
};

export const prompt = <T extends any>(item: PromptItem<T>) =>
	new Promise<T | null>((resolve) =>
		update((prompts) => {
			prompts.push({ item, resolve });
		}),
	);

document.addEventListener(
	"keydown",
	(ev) => {
		if (ev.key === "Escape") {
			update((prompts) => {
				prompts.shift()?.resolve(null);
			});
		}
	},
	{ capture: true, passive: true },
);

export const isAnyPromptActive = () => !!getStateRaw()[0];
