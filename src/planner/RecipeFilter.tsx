import { useState } from "preact/hooks";
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

const toggleBasic = (index: number) =>
	update((draft) => {
		draft.basicRecipes[index] = !draft.basicRecipes[index];
	});
const toggleAlternate = (index: number) =>
	update((draft) => {
		draft.alternateRecipes[index] = !draft.alternateRecipes[index];
	});
const setAllBasic = (newValue: boolean) =>
	update((draft) => {
		draft.basicRecipes.fill(newValue);
	});
const setAllAlternate = (newValue: boolean) =>
	update((draft) => {
		draft.alternateRecipes.fill(newValue);
	});

const makeRecipeFilter = (
	useActive: () => boolean[],
	list: Recipe[],
	toggle: (index: number) => void,
	setAll: (newValue: boolean) => void,
	titleText: string,
) =>
	function RecipeFilter() {
		const active = useActive();
		const [search, changeSearch] = useState("");

		const { testRegex, highlightRegex } = makeSearchRegexes(search);
		const someChecked = active.some((b) => b);
		const someUnchecked = active.some((b) => !b);

		return (
			<div class="recipe-filter">
				<h2 class="title">{titleText}</h2>
				<input
					type="text"
					value={search}
					placeholder="Filter recipes"
					onInput={(ev) => changeSearch(ev.currentTarget.value)}
				/>
				<div class="entry">
					<label data-has-checkbox>
						<input
							type="checkbox"
							checked={someChecked}
							// @ts-ignore https://github.com/preactjs/preact/issues/3836
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
				<div class="scrollable">
					{list.map(
						(recipe, index) =>
							testRegex.test(recipe.DisplayName) && (
								<div class="entry">
									<label data-has-checkbox data-tooltip={recipe.ClassName}>
										<input type="checkbox" checked={active[index]} onChange={() => toggle(index)} />
										<img class="icon" src={imageForRecipe(recipe)} />
										<span>{highlightText(recipe.DisplayName, highlightRegex)}</span>
									</label>
								</div>
							),
					)}
				</div>
			</div>
		);
	};

export const RecipeFilterBasic = makeRecipeFilter(
	() => useSelector((state) => state.basicRecipes),
	BasicRecipes,
	toggleBasic,
	setAllBasic,
	"Basic Recipes",
);
export const RecipeFilterAlternate = makeRecipeFilter(
	() => useSelector((state) => state.alternateRecipes),
	AlternateRecipes,
	toggleAlternate,
	setAllAlternate,
	"Alternate Recipes",
);
