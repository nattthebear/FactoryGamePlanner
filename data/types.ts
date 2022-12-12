export interface Item {
	ClassName: string;
	DisplayName: string;
	Description: string;
	Icon: string;
	IsResource: boolean;
	IsPiped: boolean;
}

export interface Recipe {
	ClassName: string;
	DisplayName: string;
	Inputs: { Item: Item, Quantity: number }[];
	Outputs: { Item: Item, Quantity: number }[];
	/** Crafting time in seconds */
	Duration: number;
	Building: Building;
}

export interface Building {
	ClassName: string;
	DisplayName: string;
	Description: string;
}
