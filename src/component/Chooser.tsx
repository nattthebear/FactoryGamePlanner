import { LayerInstance, VNode, effect, scheduleUpdate } from "vdomk";
import scrollIntoView from "scroll-into-view-if-needed";
import { highlightText, makeSearchRegexes } from "../util";
import "./Chooser.css";

export interface ChooserItem {
	/** Shown on the left of the item */
	adornment: VNode;
	/** Searchable */
	name: string;
}

export interface Props<T extends ChooserItem> {
	items: T[];
	value: T | null;
	changeValue(newValue: T | null): void;
	onTentative?(newValue: T | null): void;
}

export function Chooser<T extends ChooserItem>(_: Props<T>, instance: LayerInstance) {
	let search = "";
	let tentative: T | null = null;
	let lastTentative: T | null = null;

	const inputRef = (value: HTMLInputElement | null) => (inputElt = value);
	const scrollRef = (value: HTMLDivElement | null) => (scrollElt = value);
	let inputElt: HTMLInputElement | null = null;
	let scrollElt: HTMLDivElement | null = null;

	effect(instance, () => inputElt!.focus());

	return ({ items, value, changeValue, onTentative }: Props<T>) => {
		const { testRegex, highlightRegex } = makeSearchRegexes(search);

		function renderItem(item: T) {
			const { adornment, name } = item;
			const className = item === value ? "item selected" : item === tentative ? "item tentative" : "item";
			return (
				<div class={className} onClick={() => changeValue(item)}>
					<div class="adornment">{adornment}</div>
					<div class="text">{highlightText(name, highlightRegex)}</div>
				</div>
			);
		}

		const relevantItems = items.filter((item) => testRegex.test(item.name));
		const exactMatch = relevantItems.find((item) => item.name.length === search.length);

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
			<div class="chooser">
				<form
					onSubmit={(ev) => {
						ev.preventDefault();
						if (tentative) {
							changeValue(tentative);
						} else if (relevantItems.length === 1) {
							changeValue(relevantItems[0]);
						} else if (exactMatch) {
							changeValue(exactMatch);
						}
					}}
				>
					<input
						type="text"
						ref={inputRef}
						value={search}
						onInput={(ev) => {
							const newSearch = ev.currentTarget.value;
							search = newSearch;
							scheduleUpdate(instance);
							const { testRegex: newTestRegex } = makeSearchRegexes(newSearch);
							if (tentative && !newTestRegex.test(newSearch)) {
								tentative = null;
								onTentative?.(null);
							}
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
									onTentative?.(relevantItems[index]);
								}
							}
						}}
					/>
				</form>
				<div class="scroll" ref={scrollRef} tabIndex={-1}>
					{relevantItems.map(renderItem)}
				</div>
			</div>
		);
	};
}
