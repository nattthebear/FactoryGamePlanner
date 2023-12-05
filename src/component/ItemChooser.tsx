import { TPC, scheduleUpdate } from "vdomk";
import { Items } from "../../data/generated/items";
import { Recipes } from "../../data/generated/recipes";
import { Item, Recipe } from "../../data/types";
import { Chooser } from "./Chooser";
import { prompt } from "../component/Prompt";

import "./ItemChooser.css";
import { FakePower, ItemsWithFakePower } from "../../data/power";

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

const formatRecipe = (recipe: Recipe) => ({
	adornment: (
		<div class="recipe-chooser-image">
			{recipe.Inputs.map((flow) => itemImage(flow.Item))}
			<span class="arrow">▶&#xfe0e;</span>
			{recipe.Outputs.map((flow) => itemImage(flow.Item))}
		</div>
	),
	name: recipe.DisplayName,
	recipe,
});

const DisplayItems = ItemsWithFakePower.map((item) => ({
	adornment: itemImage(item),
	name: item.DisplayName,
	item,
	consumingRecipes: recipeToInputs.get(item)?.map(formatRecipe),
	producingRecipes: (item === FakePower
		? Recipes.filter((r) => r.Building.PowerConsumption.sign() < 0)
		: recipeToOutputs.get(item)
	)?.map(formatRecipe),
}));
type DisplayItem = (typeof DisplayItems)[number];

const RecipeChooser: TPC<{ type: "input" | "output"; onConfirm: (value: Recipe | null) => void }> = (
	{ type, onConfirm },
	instance,
) => {
	let displayItem: DisplayItem | null = null;
	let tentativeRecipe: Recipe | null = null;

	return () => {
		const displayItems = DisplayItems.filter((di) =>
			type === "input" ? di.consumingRecipes : di.producingRecipes,
		);

		const recipes = displayItem?.[type === "input" ? "consumingRecipes" : "producingRecipes"];

		function onChangeItemValue(newValue: DisplayItem | null) {
			const newRecipes = newValue?.[type === "input" ? "consumingRecipes" : "producingRecipes"];
			if (newRecipes?.length === 1) {
				onConfirm(newRecipes[0].recipe);
			} else {
				displayItem = newValue;
				scheduleUpdate(instance);
			}
		}

		return (
			<>
				<Chooser items={displayItems} value={displayItem} changeValue={onChangeItemValue} />
				{recipes && (
					<>
						<div class="recipe-chooser-divider" />
						<Chooser
							items={recipes}
							value={null}
							changeValue={(dr) => onConfirm(dr?.recipe ?? null)}
							onTentative={(dr) => {
								tentativeRecipe = dr?.recipe ?? null;
								scheduleUpdate(instance);
							}}
						/>
					</>
				)}
				<div class="dialog-buttons">
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button disabled={!recipes || !tentativeRecipe} onClick={() => onConfirm(tentativeRecipe)}>
						Ok
					</button>
				</div>
			</>
		);
	};
};

/** Choose an item.
 * @param options If not provided, choice will be taken from all items.
 */
export const chooseItem = async (title: string, options?: Item[]) => {
	const chooserItems = (options ?? Items).map((item) => ({
		adornment: itemImage(item),
		name: item.DisplayName,
		item,
	}));

	return prompt<Item | null>({
		title,
		render: (onConfirm) => (
			<Chooser items={chooserItems} value={null} changeValue={(di) => onConfirm(di?.item ?? null)} />
		),
	});
};

export const chooseRecipeByOutput = () =>
	prompt<Recipe | null>({
		title: "Choose output item and recipe:",
		render: (onConfirm) => <RecipeChooser type="output" onConfirm={onConfirm} />,
	});

export const chooseRecipeByInput = () =>
	prompt<Recipe | null>({
		title: "Choose input item and recipe:",
		render: (onConfirm) => <RecipeChooser type="input" onConfirm={onConfirm} />,
	});

const chooseRecipeHelper = async (recipes: Recipe[] | undefined) => {
	if (!recipes) {
		return null;
	}
	if (recipes.length === 1) {
		return recipes[0];
	}
	const drs = recipes.map(formatRecipe);
	return prompt<Recipe | null>({
		title: "Choose recipe:",
		render: (onConfirm) => <Chooser items={drs} value={null} changeValue={(dr) => onConfirm(dr?.recipe ?? null)} />,
	});
};

export const canChooseRecipeForOutput = (desiredOutput: Item) => !!recipeToOutputs.get(desiredOutput);
export const chooseRecipeForOutput = async (desiredOutput: Item) => {
	const recipes = recipeToOutputs.get(desiredOutput);
	return chooseRecipeHelper(recipes);
};

export const canChooseRecipeForInput = (desiredInput: Item) => !!recipeToInputs.get(desiredInput);
export const chooseRecipeForInput = async (desiredInput: Item) => {
	const recipes = recipeToInputs.get(desiredInput);
	return chooseRecipeHelper(recipes);
};
