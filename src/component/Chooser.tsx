import { useState } from "preact/hooks";
import "./Chooser.css";

export interface ChooserItem {
	/** Shown on the left of the item */
	adornment: preact.ComponentChild;
	/** Searchable */
	name: string;
}

export interface Props {
	items: ChooserItem[];
	index: number;
	changeIndex(newIndex: number): void;
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

export function Chooser({ items, index, changeIndex }: Props) {
	const [search, changeSearch] = useState("");

	const regex = search ? new RegExp(escapeRegExp(search), "ig") : null;

	function renderItem({ adornment, name }: ChooserItem, thisIndex: number) {
		const className = thisIndex === index ? "item selected" : "item";
		return (
			<div class={className} onClick={() => changeIndex(thisIndex)}>
				<div>{adornment}</div>
				<div class="text">{regex ? highlightText(name, regex) : name}</div>
			</div>
		);
	}

	const relevantItems = items
		.map((item, index) => ({ item, index }))
		.filter((o) => !regex || regex.test(o.item.name));
	const exactMatch = relevantItems.find((o) => o.item.name.length === search.length);

	return (
		<div class="chooser">
			<form
				onSubmit={(ev) => {
					ev.preventDefault();
					if (exactMatch) {
						changeIndex(exactMatch.index);
					} else if (relevantItems.length === 1) {
						changeIndex(relevantItems[0].index);
					}
				}}
			>
				<input
					type="text"
					value={search}
					onInput={(ev) => {
						changeSearch(ev.currentTarget.value);
					}}
				/>
			</form>
			<div class="scroll">{relevantItems.map((o) => renderItem(o.item, o.index))}</div>
		</div>
	);
}
