import { useEffect, useReducer, useState } from "preact/hooks";
import { makeStore } from "../store/MakeStore";
import "./Prompt.css";

export interface PromptItem<T> {
	title: string;
	render: (onConfirm: (value: T) => void) => preact.ComponentChild;
}

interface PromptImpl {
	item: PromptItem<any>;
	resolve: (value: any) => void;
}

const { useSelector, update, getStateRaw } = makeStore<PromptImpl[]>([]);

export function PromptRoot() {
	const prompt = useSelector((prompts) => prompts[0]);
	if (!prompt) {
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
				<div class="title">{prompt.item.title}</div>
				<div class="form">{prompt.item.render(onConfirm)}</div>
			</div>
		</div>
	);
}

export const prompt = <T extends any>(item: PromptItem<T>) =>
	new Promise<T | null>((resolve) =>
		update((prompts) => {
			prompts.push({ item, resolve });
		})
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
	{ capture: true, passive: true }
);

export const isAnyPromptActive = () => !!getStateRaw()[0];
