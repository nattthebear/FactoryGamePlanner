import { BigRat } from "../src/math/BigRat";

export interface Item {
	ClassName: string;
	DisplayName: string;
	Description: string;
	Icon: string;
	IsResource: boolean;
	IsPiped: boolean;
	Color: string;
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
}

export interface Building {
	ClassName: string;
	DisplayName: string;
	Description: string;
}
