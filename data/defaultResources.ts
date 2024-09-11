import { BigRat } from "../src/math/BigRat";
import { ItemsByClassName } from "./lookups";
import type { Item } from "./types";

export const defaultResourceData = new Map<Item, BigRat>(
	[
		{ className: "Desc_OreIron_C", rate: 92100 },
		{ className: "Desc_OreCopper_C", rate: 36900 },
		{ className: "Desc_Stone_C", rate: 69900 },
		{ className: "Desc_Coal_C", rate: 42300 },
		{ className: "Desc_OreGold_C", rate: 15000 },
		{ className: "Desc_LiquidOil_C", rate: 12600 },
		{ className: "Desc_RawQuartz_C", rate: 13500 },
		{ className: "Desc_Sulfur_C", rate: 10800 },
		{ className: "Desc_OreBauxite_C", rate: 12300 },
		{ className: "Desc_OreUranium_C", rate: 2100 },
		{ className: "Desc_NitrogenGas_C", rate: 12000 },
		{ className: "Desc_SAM_C", rate: 10200 },
	].map(({ className, rate }) => [ItemsByClassName.get(className)!, BigRat.fromInteger(rate)]),
);
