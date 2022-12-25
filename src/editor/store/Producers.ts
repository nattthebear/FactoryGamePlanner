import { immerable } from "../../immer";
import { Item, Recipe, RecipeFlow } from "../../../data/types";
import { BigRat } from "../../math/BigRat";
import { generateId, NodeId, SIXTY } from "./Common";
import { BuildingMap, ProducerDrawing, Sink as SinkGfx, Source as SourceGfx } from "../ProducerArt";
import { Flow, Point } from "../../util";

export abstract class Producer implements Point {
	[immerable] = true;
	id = generateId();

	x: number;
	y: number;

	rate: BigRat;

	inputs: NodeId[][] = [];
	outputs: NodeId[][] = [];

	inputAttachPoints: Point[] = [];
	outputAttachPoints: Point[] = [];

	constructor(x: number, y: number, rate: BigRat) {
		this.x = x;
		this.y = y;
		this.rate = rate;
	}

	abstract inputFlows(): Flow[];
	abstract outputFlows(): Flow[];

	abstract clone(): this;

	abstract getDrawing(): ProducerDrawing;

	abstract canCombineWith(other: Producer): boolean;
}

export class ProductionBuilding extends Producer {
	recipe: Recipe;
	/** Fractional rate of a normal building's production */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, recipe: Recipe) {
		super(x, y, rate);
		this.recipe = recipe;
		this.inputs = recipe.Inputs.map(() => []);
		this.outputs = recipe.Outputs.map(() => []);

		const drawing = this.getDrawing();
		this.inputAttachPoints = [];
		{
			let s = 0;
			let l = 0;
			for (const input of this.recipe.Inputs) {
				this.inputAttachPoints.push(
					input.Item.IsPiped ? drawing.attach.input.liquid[l++] : drawing.attach.input.solid[s++]
				);
			}
		}
		this.outputAttachPoints = [];
		{
			let s = 0;
			let l = 0;
			for (const output of this.recipe.Outputs) {
				this.outputAttachPoints.push(
					output.Item.IsPiped ? drawing.attach.output.liquid[l++] : drawing.attach.output.solid[s++]
				);
			}
		}
	}

	private toFlow(flow: RecipeFlow): Flow {
		const itemsPerSecond = this.rate.div(this.recipe.Duration).mul(flow.Quantity);
		const itemsPerMinute = itemsPerSecond.mul(SIXTY);
		return { rate: itemsPerMinute, item: flow.Item };
	}

	inputFlows(): Flow[] {
		return this.recipe.Inputs.map((f) => this.toFlow(f));
	}
	outputFlows(): Flow[] {
		return this.recipe.Outputs.map((f) => this.toFlow(f));
	}

	clone(): this {
		return new ProductionBuilding(this.x, this.y, this.rate, this.recipe) as this;
	}

	getDrawing(): ProducerDrawing {
		return BuildingMap[this.recipe.Building.ClassName];
	}

	canCombineWith(other: Producer): boolean {
		return other instanceof ProductionBuilding && other.recipe === this.recipe;
	}
}

export class Sink extends Producer {
	item: Item;
	/** sink rate in items per minute */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, item: Item) {
		super(x, y, rate);
		this.item = item;
		this.inputs = [[]];

		this.inputAttachPoints = this.getDrawing().attach.input.either;
	}

	inputFlows(): Flow[] {
		return [{ rate: this.rate, item: this.item }];
	}
	outputFlows(): Flow[] {
		return [];
	}

	clone(): this {
		return new Sink(this.x, this.y, this.rate, this.item) as this;
	}

	getDrawing(): ProducerDrawing {
		return SinkGfx;
	}

	canCombineWith(other: Producer): boolean {
		return other instanceof Sink && other.item === this.item;
	}
}

export class Source extends Producer {
	item: Item;
	/** source rate in items per minute */
	declare rate: BigRat;

	constructor(x: number, y: number, rate: BigRat, item: Item) {
		super(x, y, rate);
		this.item = item;
		this.outputs = [[]];

		this.outputAttachPoints = this.getDrawing().attach.output.either;
	}

	inputFlows(): Flow[] {
		return [];
	}
	outputFlows(): Flow[] {
		return [{ rate: this.rate, item: this.item }];
	}

	clone(): this {
		return new Source(this.x, this.y, this.rate, this.item) as this;
	}

	getDrawing(): ProducerDrawing {
		return SourceGfx;
	}

	canCombineWith(other: Producer): boolean {
		return other instanceof Source && other.item === this.item;
	}
}
