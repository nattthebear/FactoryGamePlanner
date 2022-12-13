export interface Item {
	ClassName: string;
	DisplayName: string;
	Description: string;
	Icon: string;
	IsResource: boolean;
	IsPiped: boolean;
}

export interface RecipeFlow {
	Item: Item;
	Quantity: number;
}

export interface Recipe {
	ClassName: string;
	DisplayName: string;
	Inputs: RecipeFlow[];
	Outputs: RecipeFlow[];
	/** Crafting time in seconds */
	Duration: number;
	Building: Building;
}

export interface Building {
	ClassName: string;
	DisplayName: string;
	Description: string;
}
