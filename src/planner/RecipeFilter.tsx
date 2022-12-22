import { Recipe } from "../../data/types";
import { AlternateRecipes, BasicRecipes, update, useSelector } from "./store/Store";

const toggleBasic = (index: number) =>
	update((draft) => {
		draft.basicRecipes[index] = !draft.basicRecipes[index];
	});
const toggleAlternate = (index: number) =>
	update((draft) => {
		draft.alternateRecipes[index] = !draft.alternateRecipes[index];
	});

const makeRecipeFilter = (useActive: () => boolean[], list: Recipe[], toggle: (index: number) => void) =>
	function RecipeFilter() {
		const active = useActive();

		return (
			<div class="recipe-filter">
				{list.map((recipe, index) => (
					<div class="entry">
						<input type="checkbox" checked={active[index]} onChange={() => toggle(index)} />
						{recipe.DisplayName}
					</div>
				))}
			</div>
		);
	};

export const RecipeFilterBasic = makeRecipeFilter(
	() => useSelector((state) => state.basicRecipes),
	BasicRecipes,
	toggleBasic
);
export const RecipeFilterAlternate = makeRecipeFilter(
	() => useSelector((state) => state.alternateRecipes),
	AlternateRecipes,
	toggleAlternate
);
