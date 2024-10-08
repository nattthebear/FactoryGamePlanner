import { BigRat } from "../src/math/BigRat";

export interface Item {
	ClassName: string;
	DisplayName: string;
	/** When serializing or deserializing to URLs, the exact numeric ID used for this item */
	SerializeId: number;
	Description: string;
	Icon: string;
	IsResource: boolean;
	IsPiped: boolean;
	Color: string;
	SinkPoints: BigRat;
	SortOrder: number;
}

export interface RecipeFlow {
	Item: Item;
	/** Items per minute */
	Rate: BigRat;
}

export interface Recipe {
	ClassName: string;
	DisplayName: string;
	/** When serializing or deserializing to URLs, the exact numeric ID used for this recipe (but only in the editor) */
	SerializeId: number;
	Inputs: RecipeFlow[];
	Outputs: RecipeFlow[];
	Building: Building;
	Alternate: boolean;
	/** If set, overrides the building power consumption */
	PowerConsumption: BigRat | null;
}

export interface Building {
	ClassName: string;
	DisplayName: string;
	Description: string;
	/** Continuous power consumption in MW.  Negative is a power producer. */
	PowerConsumption: BigRat;
	/** Overclocking power exponent */
	OverclockPowerFactor: BigRat;
}
