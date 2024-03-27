import { filterNulls } from "../src/util";
import { RawItems } from "./generated/items";
import { RawRecipes } from "./generated/recipes";

export const RecipesByClassName = new Map(filterNulls(RawRecipes).map(r => [r.ClassName, r]));
export const ItemsByClassName = new Map(filterNulls(RawItems).map(i => [i.ClassName, i]));
