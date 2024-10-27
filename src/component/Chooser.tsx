import { LayerInstance, VNode, effect, scheduleUpdate } from "vdomk";
import scrollIntoView from "scroll-into-view-if-needed";
import { highlightText, makeSearchRegexes } from "../util";
import { autoFocus } from "../hook/autoFocus";

import "./Chooser.css";

export interface ChooserItem {
	/** Shown on the left of the item */
	adornment: VNode;
	/** Searchable */
	name: string;
}

export interface Props<T extends ChooserItem> {
	items: T[];
	/** The item currently highlighted as selectetd */
	selected: T | null;
	/** Called when the user clicks on an item, or submits the form with an unambiguous choice */
	onSelect(newValue: T): void;
	/**
	 * If passed, will render submit buttons below the choser.  SubmitValue is the value that will
	 * be chosen for onSelect if the user submits the form.
	 */
	renderButtons?(submitValue: T | null): VNode;
}

export function Chooser<T extends ChooserItem>(_: Props<T>, instance: LayerInstance) {
	let search = "";
	let tentative: T | null = null;
	let lastTentative: T | null = null;

	const scrollRef = (value: HTMLDivElement | null) => {
		scrollElt = value;
	};
	let scrollElt: HTMLDivElement | null = null;

	return ({ items, selected, onSelect, renderButtons }: Props<T>) => {
		const { testRegex, highlightRegex } = makeSearchRegexes(search);

		if (tentative && !testRegex.test(tentative.name)) {
			tentative = null;
		}

		const relevantItems = items.filter((item) => testRegex.test(item.name));
		const exactMatch = relevantItems.find((item) => item.name.length === search.length);

		const submitValue = tentative ? tentative : relevantItems.length === 1 ? relevantItems[0] : exactMatch ?? null;

		function renderItem(item: T) {
			const { adornment, name } = item;
			const className = item === selected ? "item selected" : item === tentative ? "item tentative" : "item";
			return (
				<div class={className} onClick={() => onSelect(item)}>
					<div class="adornment">{adornment}</div>
					<div class="text">{highlightText(name, highlightRegex)}</div>
				</div>
			);
		}

		effect(instance, () => {
			if (tentative && tentative !== lastTentative) {
				const el = scrollElt?.querySelector(".tentative");
				if (el) {
					scrollIntoView(el, { scrollMode: "if-needed" });
				}
			}
			lastTentative = tentative;
		});

		return (
			<>
				<div class="chooser">
					<form
						onSubmit={(ev) => {
							ev.preventDefault();
							if (submitValue) {
								onSelect(submitValue);
							}
						}}
					>
						<input
							type="text"
							ref={autoFocus}
							value={search}
							onInput={(ev) => {
								search = ev.currentTarget.value;
								scheduleUpdate(instance);
							}}
							onKeyDown={(ev) => {
								if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
									ev.preventDefault();
									if (relevantItems.length > 0) {
										let index = (relevantItems as (T | null)[]).indexOf(tentative);
										index +=
											ev.key === "ArrowDown"
												? 1
												: index < 0
												? relevantItems.length
												: relevantItems.length - 1;
										index %= relevantItems.length;
										tentative = relevantItems[index];
										scheduleUpdate(instance);
									}
								}
							}}
						/>
					</form>
					<div class="scroll" ref={scrollRef} tabIndex={-1}>
						{relevantItems.map(renderItem)}
					</div>
				</div>
				{renderButtons?.(submitValue)}
			</>
		);
	};
}
