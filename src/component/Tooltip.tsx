import { computePosition, shift, flip } from "@floating-ui/dom";
import "./Tooltip.css";

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
				tooltip.textContent = label;
				tooltip.style.display = "";
				updateStyles();
			} else {
				tooltip.style.display = "none";
			}
		}
	});
	document.addEventListener("scroll", updateStyles, { passive: true, capture: true });
}
