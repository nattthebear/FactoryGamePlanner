import { useEffect, useState } from "preact/hooks";
import { Items } from "../../data/generated/items";
import { Item, Recipe } from "../../data/types";
import { Chooser } from "./Chooser";
import { prompt } from "./Prompt";

import "./ItemChooser.css";
import { Recipes } from "../../data/generated/recipes";

function fillMultiMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
	let array = map.get(key);
	if (!array) {
		map.set(key, (array = []));
	}
	array.push(value);
}

const recipeToOutputs = new Map<Item, Recipe[]>();
const recipeToInputs = new Map<Item, Recipe[]>();
for (const recipe of Recipes) {
	for (const flow of recipe.Inputs) {
		fillMultiMap(recipeToInputs, flow.Item, recipe);
	}
	for (const flow of recipe.Outputs) {
		fillMultiMap(recipeToOutputs, flow.Item, recipe);
	}
}

const itemImage = (item: Item) => <img class="item-chooser-image" src={item.Icon} />;

const DisplayItems = Items.map((item) => ({
	adornment: itemImage(item),
	name: item.DisplayName,
	item,
	consumingRecipes: recipeToInputs.get(item),
	producingRecipes: recipeToOutputs.get(item),
}));

const formatRecipe = (recipe: Recipe) => ({
	adornment: (
		<div class="recipe-chooser-image">
			{recipe.Inputs.map((flow) => itemImage(flow.Item))}
			<span>→</span>
			{recipe.Outputs.map((flow) => itemImage(flow.Item))}
		</div>
	),
	name: recipe.DisplayName,
	recipe,
});

function RecipeChooser({ type, onConfirm }: { type: "input" | "output"; onConfirm: (value: Recipe | null) => void }) {
	const [itemIndex, changeItemIndex] = useState(-1);
	const items = DisplayItems.filter((i) => (type === "input" ? i.consumingRecipes : i.producingRecipes));

	const recipes = items[itemIndex]?.[type === "input" ? "consumingRecipes" : "producingRecipes"];

	return (
		<>
			<Chooser items={items} index={itemIndex} changeIndex={changeItemIndex} />
			{recipes && (
				<Chooser
					items={recipes.map(formatRecipe)}
					index={-1}
					changeIndex={(recipeIndex) => onConfirm(recipes[recipeIndex] ?? null)}
				/>
			)}
		</>
	);
}

export const chooseItem = (title: string) =>
	prompt<Item | null>({
		title,
		render: (onConfirm) => (
			<Chooser
				items={DisplayItems}
				index={-1}
				changeIndex={(index) => onConfirm(DisplayItems[index]?.item ?? null)}
			/>
		),
	});

export const chooseRecipeByOutput = () =>
	prompt<Recipe | null>({
		title: "Choose item and recipe",
		render: (onConfirm) => <RecipeChooser type="output" onConfirm={onConfirm} />,
	});

export const chooseRecipeByInput = () =>
	prompt<Recipe | null>({
		title: "Choose item and recipe",
		render: (onConfirm) => <RecipeChooser type="input" onConfirm={onConfirm} />,
	});
