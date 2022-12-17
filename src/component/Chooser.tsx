import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "preact/hooks";
import scrollIntoView from "scroll-into-view-if-needed";
import { useStateWithPrev } from "../hook/useStateWithPrev";
import "./Chooser.css";

export interface ChooserItem {
	/** Shown on the left of the item */
	adornment: preact.ComponentChild;
	/** Searchable */
	name: string;
}

export interface Props<T extends ChooserItem> {
	items: T[];
	value: T | null;
	changeValue(newValue: T | null): void;
}

function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, regex: RegExp) {
	const textNodes: preact.ComponentChild[] = [];
	regex.lastIndex = 0;
	while (true) {
		const from = regex.lastIndex;
		const match = regex.exec(text);
		if (!match) {
			textNodes.push(text.slice(from));
			break;
		}
		if (match.index !== from) {
			textNodes.push(text.slice(from, match.index));
		}
		textNodes.push(<strong>{match[0]}</strong>);
	}
	return textNodes;
}

interface State<T> {
	search: string;
	tentative: T | null;
	regex: RegExp | null;
	relevant: T[];
}

export function Chooser<T extends ChooserItem>({ items, value, changeValue }: Props<T>) {
	const [search, changeSearch] = useState("");
	const [tentative, changeTentative, oldTentative] = useStateWithPrev<T | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		inputRef.current!.focus();
	}, []);
	useLayoutEffect(() => {
		if (tentative && tentative !== oldTentative) {
			const el = scrollRef.current?.querySelector(".tentative");
			if (el) {
				scrollIntoView(el, { scrollMode: "if-needed" });
			}
		}
	}, [tentative, oldTentative]);

	const regex = search ? new RegExp(escapeRegExp(search), "ig") : null;

	function renderItem(item: T) {
		const { adornment, name } = item;
		const className = item === value ? "item selected" : item === tentative ? "item tentative" : "item";
		return (
			<div class={className} onClick={() => changeValue(item)}>
				<div>{adornment}</div>
				<div class="text">{regex ? highlightText(name, regex) : name}</div>
			</div>
		);
	}

	const relevantItems = items.filter((item) => !regex || regex.test(item.name));
	const exactMatch = relevantItems.find((item) => item.name.length === search.length);

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
						changeSearch(newSearch);
						const newRegex = newSearch ? new RegExp(escapeRegExp(newSearch), "ig") : null;
						if (tentative && newRegex && !newRegex.test(newSearch)) {
							changeTentative(null);
						}
					}}
					onKeyDown={(ev) => {
						if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
							ev.preventDefault();
							if (relevantItems.length > 0) {
								let index = (relevantItems as (T | null)[]).indexOf(tentative);
								index += ev.key === "ArrowDown" ? 1 : index < 0 ? 0 : relevantItems.length - 1;
								index %= relevantItems.length;
								changeTentative(relevantItems[index]);
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
}
