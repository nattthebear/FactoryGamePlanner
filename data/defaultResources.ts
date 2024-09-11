import { BigRat } from "../src/math/BigRat";
import { ItemsByClassName } from "./lookups";
import type { Item } from "./types";

export const defaultResourceData = new Map<Item, BigRat>(
	[
		{ className: "Desc_OreIron_C", rate: 70380 },
		{ className: "Desc_OreCopper_C", rate: 28860 },
		{ className: "Desc_Stone_C", rate: 52860 },
		{ className: "Desc_Coal_C", rate: 30900 },
		{ className: "Desc_OreGold_C", rate: 11040 },
		{ className: "Desc_LiquidOil_C", rate: 11700 },
		{ className: "Desc_RawQuartz_C", rate: 10500 },
		{ className: "Desc_Sulfur_C", rate: 6840 },
		{ className: "Desc_OreBauxite_C", rate: 9780 },
		{ className: "Desc_OreUranium_C", rate: 2100 },
		{ className: "Desc_NitrogenGas_C", rate: 12000 },
		{ className: "Desc_SAM_C", rate: 5400 },
	].map(({ className, rate }) => [ItemsByClassName.get(className)!, BigRat.fromInteger(rate)]),
);
