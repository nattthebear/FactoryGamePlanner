import { LayerInstance, TPC, scheduleUpdate } from "vdomk";
import { Recipe } from "../../data/types";
import { highlightText, makeSearchRegexes } from "../util";
import { AlternateRecipes, BasicRecipes, update, useSelector } from "./store/Store";
import { FakePower } from "../../data/power";

import "./RecipeFilter.css";

function imageForRecipe(recipe: Recipe) {
	if (recipe.Building.PowerConsumption.sign() < 0) {
		return FakePower.Icon;
	}
	return recipe.Outputs[0].Item.Icon;
}

const makeRecipeFilter = (list: Recipe[], titleText: string): TPC<{}> =>
	function RecipeFilter(_, instance) {
		const getActive = useSelector(instance, (state) => state.recipes);
		const toggle = (recipe: Recipe) =>
			update((draft) => {
				const { recipes } = draft;
				if (recipes.has(recipe)) {
					recipes.delete(recipe);
				} else {
					recipes.add(recipe);
				}
			});
		const setAll = (newValue: boolean) =>
			update((draft) => {
				const { recipes } = draft;
				if (newValue) {
					for (const recipe of list) {
						recipes.add(recipe);
					}
				} else {
					for (const recipe of list) {
						recipes.delete(recipe);
					}
				}
			});

		let search = "";

		return () => {
			const active = getActive();

			const { testRegex, highlightRegex } = makeSearchRegexes(search);

			let someChecked = false;
			let someUnchecked = false;

			const recipeBoxes = list.map((recipe) => {
				const checked = active.has(recipe);
				someChecked ||= checked;
				someUnchecked ||= !checked;

				return (
					testRegex.test(recipe.DisplayName) && (
						<div class="entry">
							<label data-has-checkbox data-tooltip={recipe.ClassName}>
								<input type="checkbox" checked={active.has(recipe)} onChange={() => toggle(recipe)} />
								<img class="icon" src={imageForRecipe(recipe)} />
								<span>{highlightText(recipe.DisplayName, highlightRegex)}</span>
							</label>
						</div>
					)
				);
			});

			return (
				<div class="recipe-filter">
					<h2 class="title">{titleText}</h2>
					<input
						type="text"
						value={search}
						placeholder="Filter recipes"
						onInput={(ev) => {
							search = ev.currentTarget.value;
							scheduleUpdate(instance);
						}}
					/>
					<div class="entry">
						<label data-has-checkbox>
							<input
								type="checkbox"
								checked={someChecked}
								indeterminate={someChecked && someUnchecked}
								onClick={() => {
									const newValue = someUnchecked && !someChecked;
									setAll(newValue);
								}}
							/>
							<div class="icon" />
							<span>Select all</span>
						</label>
					</div>
					<div class="scrollable">{recipeBoxes}</div>
				</div>
			);
		};
	};

export const RecipeFilterBasic = makeRecipeFilter(BasicRecipes, "Basic Recipes");
export const RecipeFilterAlternate = makeRecipeFilter(AlternateRecipes, "Alternate Recipes");
