import { render } from "preact";
import { computePosition, shift, flip } from "@floating-ui/dom";
import { RecipesByClassName } from "../../data/generated/recipes";
import { Recipe } from "../../data/types";
import "./Tooltip.css";
import { FakePower } from "../../data/power";

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
	return value as any;
}

export function installTooltip() {
	const tooltip = document.createElement("div");
	tooltip.className = "tooltip";
	tooltip.style.display = "none";
	document.body.appendChild(tooltip);

	let anchor: Element | null = null;

	async function updateStyles() {
		if (anchor) {
			const styles = await computePosition(anchor, tooltip, { middleware: [flip(), shift()] });
			tooltip.style.transform = `translate(${Math.round(styles.x)}px,${Math.round(styles.y)}px)`;
		}
	}

	document.addEventListener("mouseover", (event) => {
		let target = event.target as Element | null;
		let label: string | null = null;
		while (target && (label = target.getAttribute("data-tooltip")) == null) {
			target = target.parentElement;
		}
		if (anchor !== target) {
			anchor = target;
			if (label) {
				render(<TooltipContent value={label} />, tooltip);
				tooltip.style.display = "";
				updateStyles();
			} else {
				tooltip.style.display = "none";
			}
		}
	});
	document.addEventListener("scroll", updateStyles, { passive: true, capture: true });
}
