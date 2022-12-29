import { BigRat } from "../src/math/BigRat";

export interface Item {
	ClassName: string;
	DisplayName: string;
	Description: string;
	Icon: string;
	IsResource: boolean;
	IsPiped: boolean;
	Color: string;
	SinkPoints: BigRat;
}

export interface RecipeFlow {
	Item: Item;
	Quantity: BigRat;
}

export interface Recipe {
	ClassName: string;
	DisplayName: string;
	Inputs: RecipeFlow[];
	Outputs: RecipeFlow[];
	/** Crafting time in seconds */
	Duration: BigRat;
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
