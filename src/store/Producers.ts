import { ComponentChild } from "preact";
import { immerable } from "immer";
import { Item, Recipe, RecipeFlow } from "../../data/types";
import { BigRat } from "../math/BigRat";
import { Flow, generateId, NodeId, Point } from "./Common";
import { BuildingMap, Sink as SinkGfx, Source as SourceGfx } from "../art/Producers";

const EMPTY_ARRAY: never[] = [];
const SIXTY = new BigRat(60n, 1n);

export abstract class Producer implements Point {
	[immerable] = true;
	id = generateId();

	x: number;
	y: number;

	rate: BigRat;

	inputs: NodeId[][] = EMPTY_ARRAY;
	outputs: NodeId[][] = EMPTY_ARRAY;

	constructor(x: number, y: number, rate: BigRat) {
		this.x = x;
		this.y = y;
		this.rate = rate;
	}

	abstract inputFlows(): Flow[];
	abstract outputFlows(): Flow[];

	abstract clone(): this;

	abstract draw(): preact.ComponentChild;
}

export class ProductionBuilding extends Producer {
	recipe: Recipe;
	/** Fractional rate of a normal building's production */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, recipe: Recipe) {
		super(x, y, rate);
		this.recipe = recipe;
		this.inputs = recipe.Inputs.map(() => EMPTY_ARRAY);
		this.outputs = recipe.Outputs.map(() => EMPTY_ARRAY);
	}

	private toFlow = (flow: RecipeFlow): Flow => {
		const itemsPerSecond = this.rate.div(BigRat.fromInteger(this.recipe.Duration));
		const itemsPerMinute = itemsPerSecond.div(SIXTY);
		return { rate: itemsPerMinute, item: flow.Item };
	};

	inputFlows(): Flow[] {
		return this.recipe.Inputs.map(this.toFlow);
	}
	outputFlows(): Flow[] {
		return this.recipe.Outputs.map(this.toFlow);
	}

	clone(): this {
		return new ProductionBuilding(this.x, this.y, this.rate, this.recipe) as this;
	}

	draw(): ComponentChild {
		return BuildingMap[this.recipe.Building.ClassName];
	}
}

export class Sink extends Producer {
	item: Item;
	/** sink rate in items per minute */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, item: Item) {
		super(x, y, rate);
		this.item = item;
		this.inputs = [EMPTY_ARRAY];
	}

	inputFlows(): Flow[] {
		return [{ rate: this.rate, item: this.item }];
	}
	outputFlows(): Flow[] {
		return EMPTY_ARRAY;
	}

	clone(): this {
		return new Sink(this.x, this.y, this.rate, this.item) as this;
	}

	draw(): ComponentChild {
		return SinkGfx;
	}
}

export class Source extends Producer {
	item: Item;
	/** source rate in items per minute */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, item: Item) {
		super(x, y, rate);
		this.item = item;
		this.outputs = [EMPTY_ARRAY];
	}

	inputFlows(): Flow[] {
		return EMPTY_ARRAY;
	}
	outputFlows(): Flow[] {
		return [{ rate: this.rate, item: this.item }];
	}

	clone(): this {
		return new Source(this.x, this.y, this.rate, this.item) as this;
	}

	draw(): ComponentChild {
		return SourceGfx;
	}
}
