import { Buildings } from "../data/generated/buildings";
import { Items } from "../data/generated/items";
import { Recipes } from "../data/generated/recipes";
import { BigRat } from "./math/BigRat";
import { addProducer } from "./store/Actions";
import { ProductionBuilding, Sink, Source } from "./store/Producers";
import { update } from "./store/Store";

function b(index: number) {
	const ret = Recipes.find((r) => r.Building === Buildings[index]);
	if (!ret) {
		throw new Error();
	}
	return ret;
}

const tempSetup = () =>
	update((draft) => {
		for (let i = 0; i < 9; i++) {
			addProducer(new ProductionBuilding(-1000 + i * 200, 0, BigRat.ONE, b(i)))(draft);
		}
		console.log("WOW");

		addProducer(new Source(-1000, 200, BigRat.ONE, Items[0]))(draft);
		addProducer(new Sink(-800, 200, BigRat.ONE, Items[0]))(draft);
	});
export const doIt = () => setTimeout(() => tempSetup(), 500);
