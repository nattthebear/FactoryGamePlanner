import { updateStyles } from "../component/Tooltip";
import type { Point } from "../util";

export function initiateDrag(ev: MouseEvent, onDrag: (diff: Point) => boolean) {
	ev.stopPropagation();
	ev.preventDefault();
	let last = { x: ev.clientX, y: ev.clientY };

	async function mouseMove(ev: MouseEvent) {
		const p = { x: ev.clientX, y: ev.clientY };
		const dx = p.x - last.x;
		const dy = p.y - last.y;
		if (!onDrag({ x: dx, y: dy })) {
			stop();
		}
		last = p;
		await 0;
		updateStyles();
	}

	function stop() {
		document.documentElement.removeEventListener("mouseleave", stop);
		document.removeEventListener("mouseup", stop, { capture: true });
		document.removeEventListener("mousemove", mouseMove, { capture: true });
	}

	document.documentElement.addEventListener("mouseleave", stop, { passive: true });
	document.addEventListener("mouseup", stop, { capture: true, passive: true });
	document.addEventListener("mousemove", mouseMove, { capture: true, passive: true });
}
