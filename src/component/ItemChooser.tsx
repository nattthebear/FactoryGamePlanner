import { useEffect, useState } from "preact/hooks";
import { Items } from "../../data/generated/items";
import { Item } from "../../data/types";
import { Chooser } from "./Chooser";
import { prompt } from "./Prompt";

import "./ItemChooser.css";

const DisplayItems = Items.map((item) => ({
	adornment: <img class="item-chooser-image" src={item.Icon} />,
	name: item.DisplayName,
	item,
}));

function ItemChooser({ onConfirm }: { onConfirm: (value: Item | null) => void }) {
	return (
		<Chooser
			items={DisplayItems}
			index={-1}
			changeIndex={(index) => onConfirm(DisplayItems[index]?.item ?? null)}
		/>
	);
}

export const chooseItem = (title: string) =>
	prompt<Item | null>({
		title,
		render: (onConfirm) => <ItemChooser onConfirm={onConfirm} />,
	});
