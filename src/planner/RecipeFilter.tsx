import { useState } from "preact/hooks";
import { Recipe } from "../../data/types";
import { escapeTextForRegExp, highlightText } from "../util";
import { AlternateRecipes, BasicRecipes, update, useSelector } from "./store/Store";

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
	setAll: (newValue: boolean) => void
) =>
	function RecipeFilter() {
		const active = useActive();
		const [search, changeSearch] = useState("");

		const regex = search ? new RegExp(escapeTextForRegExp(search), "ig") : null;
		const someChecked = active.some((b) => b);
		const someUnchecked = active.some((b) => !b);

		return (
			<div class="recipe-filter">
				<input
					type="text"
					value={search}
					placeholder="Filter recipes"
					onInput={(ev) => changeSearch(ev.currentTarget.value)}
				/>
				<div>
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
					Select all
				</div>
				{list.map((recipe, index) =>
					!regex || regex.test(recipe.DisplayName) ? (
						<div class="entry">
							<input type="checkbox" checked={active[index]} onChange={() => toggle(index)} />
							{regex ? highlightText(recipe.DisplayName, regex) : recipe.DisplayName}
						</div>
					) : null
				)}
			</div>
		);
	};

export const RecipeFilterBasic = makeRecipeFilter(
	() => useSelector((state) => state.basicRecipes),
	BasicRecipes,
	toggleBasic,
	setAllBasic
);
export const RecipeFilterAlternate = makeRecipeFilter(
	() => useSelector((state) => state.alternateRecipes),
	AlternateRecipes,
	toggleAlternate,
	setAllAlternate
);
