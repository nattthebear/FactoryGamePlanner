import { Items } from "./generated/items";
import { Recipes } from "./generated/recipes";

export const RecipesByClassName = new Map(Recipes.map(r => [r.ClassName, r]));
export const ItemsByClassName = new Map(Items.map(i => [i.ClassName, i]));
