import { useEffect, useRef, useState } from "preact/hooks";
import { Point } from "../store/Common";
import { update, useSelector } from "../store/Store";

import "./FactoryEditor.css";

const ZOOM_MAX = 5;
const ZOOM_MIN = 1 / ZOOM_MAX;
const ZOOM_SPEED = 1.0011;

const FACTORY_SIZE = 4000;
const MIN: Point = { x: -FACTORY_SIZE / 2, y: -FACTORY_SIZE / 2 };
const MAX: Point = { x: FACTORY_SIZE / 2, y: FACTORY_SIZE / 2 };

const viewBox = `${MIN.x} ${MIN.y} ${MAX.x - MIN.x} ${MAX.y - MIN.y}`;
const backGrid = (() => {
	const GRID_INC = 100;
	const path: string[] = [];
	const raz = (value: number) =>
		value < 0 ? Math.floor(value / GRID_INC) * GRID_INC : Math.ceil(value / GRID_INC) * GRID_INC;
	const xmin = raz(MIN.x);
	const xmax = raz(MAX.x);
	const ymin = raz(MIN.y);
	const ymax = raz(MAX.y);
	for (let x = xmin; x <= xmax; x += GRID_INC) {
		path.push(`M ${x} ${ymin} l 0 ${ymax - ymin}`);
	}
	for (let y = xmin; y <= ymax; y += GRID_INC) {
		path.push(`M ${xmin} ${y} l ${xmax - xmin} 0`);
	}
	return <path class="backgrid" d={path.join(" ")} />;
})();

function clamp(n: number, min: number, max: number) {
	if (n < min) {
		return min;
	}
	if (n > max) {
		return max;
	}
	return n;
}

export function FactoryEditor() {
	const viewport = useSelector((s) => s.viewport);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const panningState = useRef<{ last: Point | null; panning: boolean }>({ last: null, panning: false });

	function onWheel(ev: WheelEvent) {
		ev.preventDefault();
		update((draft) => {
			let { zoom } = draft.viewport;
			zoom *= ZOOM_SPEED ** -ev.deltaY;
			if (zoom < ZOOM_MIN) {
				zoom = ZOOM_MIN;
			}
			if (zoom > ZOOM_MAX) {
				zoom = ZOOM_MAX;
			}
			if (zoom > 0.94 && zoom < 1.06) {
				zoom = 1;
			}
			draft.viewport.zoom = zoom;
		});
	}

	function panStart(ev: MouseEvent) {
		panningState.current.last = { x: ev.screenX, y: ev.screenY };
		panningState.current.panning = true;
	}

	useEffect(() => {
		function mouseMove(ev: MouseEvent) {
			const p = { x: ev.screenX, y: ev.screenY };
			if (panningState.current.panning && panningState.current.last) {
				const dx = p.x - panningState.current.last.x;
				const dy = p.y - panningState.current.last.y;
				update((draft) => {
					const { center, zoom } = draft.viewport;
					const x = clamp(center.x + dx / zoom, MIN.x, MAX.x);
					const y = clamp(center.y + dy / zoom, MIN.y, MAX.y);
					center.x = x;
					center.y = y;
				});
			}
			panningState.current.last = p;
		}
		function blur() {
			panningState.current.last = null;
			panningState.current.panning = false;
		}
		function mouseUp() {
			panningState.current.panning = false;
		}
		window.addEventListener("blur", blur, { capture: true, passive: true });
		document.addEventListener("mouseup", mouseUp, { capture: true, passive: true });
		document.addEventListener("mousemove", mouseMove, { capture: true, passive: true });
		return () => {
			window.removeEventListener("blur", blur, { capture: true });
			document.removeEventListener("mouseup", mouseUp, { capture: true });
			document.removeEventListener("mousemove", mouseMove, { capture: true });
		};
	}, []);

	const transform = `transform: translate(-50%, -50%) scale(${viewport.zoom}) translate(${viewport.center.x}px, ${viewport.center.y}px)`;

	return (
		<div class="viewport" tabIndex={-1} ref={viewportRef} onWheelCapture={onWheel}>
			<svg viewBox={viewBox} style={transform} onMouseDown={panStart}>
				{backGrid}
			</svg>
		</div>
	);
}
