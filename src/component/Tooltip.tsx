import { createRoot } from "vdomk";
import { computePosition, shift, flip } from "@floating-ui/dom";
import { RecipesByClassName } from "../../data/generated/recipes";
import { Recipe } from "../../data/types";
import "./Tooltip.css";
import { FakePower } from "../../data/power";
import { toId } from "../editor/store/Common";
import { ProducerTooltip } from "../editor/ProducerTooltip";

const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.style.display = "none";
let anchor: Element | null = null;

function RecipeTooltip({ recipe }: { recipe: Recipe }) {
	return (
		<div class="recipe-tooltip">
			<em class="building-name">{recipe.Building.DisplayName}</em>
			<div class="io">
				{recipe.Inputs.map(({ Item }) => (
					<img src={Item.Icon} />
				))}
				<div class="arrow">▶&#xfe0e;</div>
				{recipe.Outputs.map(({ Item }) => (
					<img src={Item.Icon} />
				))}
				{recipe.Building.PowerConsumption.sign() < 0 && <img src={FakePower.Icon} />}
			</div>
		</div>
	);
}

function TooltipContent({ value }: { value: string }) {
	const recipe = RecipesByClassName.get(value);
	if (recipe) {
		return <RecipeTooltip recipe={recipe} />;
	}
	let match: RegExpMatchArray | null;
	match = value.match(/^\$producer:(\d+)$/);
	if (match) {
		return <ProducerTooltip id={toId(match[1])} />;
	}
	return value as any;
}

export async function updateStyles() {
	if (anchor) {
		const styles = await computePosition(anchor, tooltip, { middleware: [flip(), shift()], strategy: "fixed" });
		tooltip.style.transform = `translate(${Math.round(styles.x)}px,${Math.round(styles.y)}px)`;
	}
}

export function installTooltip() {
	document.body.appendChild(tooltip);

	const root = createRoot(tooltip, null);

	document.addEventListener("mouseover", async (event) => {
		let target = event.target as Element | null;
		let label: string | null = null;
		while (target && (label = target.getAttribute("data-tooltip")) == null) {
			target = target.parentElement;
		}
		if (anchor !== target) {
			anchor = target;
			if (label) {
				await root.render(<TooltipContent value={label} />);
				tooltip.style.display = "";
				updateStyles();
			} else {
				tooltip.style.display = "none";
			}
		}
	});
	document.addEventListener("scroll", updateStyles, { passive: true, capture: true });
}
