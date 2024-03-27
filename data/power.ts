import { BigRat } from "../src/math/BigRat";
import { Items } from "./generated/items";
import { ItemsByClassName } from "./lookups";
import type { Item } from "./types";

import TXUI_MIcon_Power from "data-url:./generated/images/TXUI_MIcon_Power.png";

const FakePowerImage = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100"><rect width="100" height="100" fill="#E69344" rx="10" /><image href="${TXUI_MIcon_Power}" x="5" y="5" width="90" height="90" /></svg>`;
const FakePowerUrl = `data:image/svg+xml,${escape(FakePowerImage)}`;

/** A fake, partially functional item for situations where a representation of power is needed */
export const FakePower: Item = {
	ClassName: "FakePower",
	DisplayName: "Power",
	SerializeId: 116,
	Description: "",
	IsResource: false,
	Icon: FakePowerUrl,
	IsPiped: false,
	Color: "",
	SinkPoints: BigRat.ZERO,
	SortOrder: ItemsByClassName.get("Desc_Water_C")!.SortOrder + 0.5,
};

export const ItemsWithFakePower = [...Items, FakePower];
