import { useEffect, useRef } from "preact/hooks";
import { Point } from "../util";

export function useDrag(onDrag: (diff: Point) => boolean) {
	const dragState = useRef<{ last: Point | null; dragging: boolean }>({ last: null, dragging: false });

	function dragStart(ev: MouseEvent) {
		ev.preventDefault();
		dragState.current.last = { x: ev.clientX, y: ev.clientY };
		dragState.current.dragging = true;
	}

	useEffect(() => {
		function mouseMove(ev: MouseEvent) {
			const p = { x: ev.clientX, y: ev.clientY };
			if (dragState.current.dragging && dragState.current.last) {
				const dx = p.x - dragState.current.last.x;
				const dy = p.y - dragState.current.last.y;
				if (!onDrag({ x: dx, y: dy })) {
					dragState.current.dragging = false;
				}
			}
			dragState.current.last = p;
		}
		function mouseLeave() {
			dragState.current.last = null;
			dragState.current.dragging = false;
		}
		function mouseUp() {
			dragState.current.dragging = false;
		}
		document.documentElement.addEventListener("mouseleave", mouseLeave, { passive: true });
		document.addEventListener("mouseup", mouseUp, { capture: true, passive: true });
		document.addEventListener("mousemove", mouseMove, { capture: true, passive: true });
		return () => {
			document.documentElement.removeEventListener("mouseleave", mouseLeave);
			document.removeEventListener("mouseup", mouseUp, { capture: true });
			document.removeEventListener("mousemove", mouseMove, { capture: true });
		};
	}, []);

	return dragStart;
}

export function initiateDrag(ev: MouseEvent, onDrag: (diff: Point) => boolean) {
	ev.stopPropagation();
	ev.preventDefault();
	let last = { x: ev.clientX, y: ev.clientY };

	function mouseMove(ev: MouseEvent) {
		const p = { x: ev.clientX, y: ev.clientY };
		const dx = p.x - last.x;
		const dy = p.y - last.y;
		if (!onDrag({ x: dx, y: dy })) {
			stop();
		}
		last = p;
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
