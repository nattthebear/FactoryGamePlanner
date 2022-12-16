import { useEffect, useRef, useState } from "preact/hooks";
import { Recipes } from "../../data/generated/recipes";
import { useDrag } from "../hook/drag";
import { useLatestValue } from "../hook/useLatestValue";
import { BigRat } from "../math/BigRat";
import { addProducer } from "../store/Actions";
import { Point, toTranslation } from "../store/Common";
import { ProductionBuilding } from "../store/Producers";
import { selectProducerIds, update, useSelector } from "../store/Store";
import { clamp, FACTORY_MAX, FACTORY_MIN } from "../util";

import "./FactoryEditor.css";
import { KeyButton } from "./KeyButton";
import { Producer } from "./Producer";

const ZOOM_MAX = 5;
const ZOOM_MIN = 1 / ZOOM_MAX;
const ZOOM_SPEED = 1.0011;

const viewBox = `${FACTORY_MIN.x} ${FACTORY_MIN.y} ${FACTORY_MAX.x - FACTORY_MIN.x} ${FACTORY_MAX.y - FACTORY_MIN.y}`;
const backGrid = (() => {
	const GRID_INC = 100;
	const path: string[] = [];
	const raz = (value: number) =>
		value < 0 ? Math.floor(value / GRID_INC) * GRID_INC : Math.ceil(value / GRID_INC) * GRID_INC;
	const xmin = raz(FACTORY_MIN.x);
	const xmax = raz(FACTORY_MAX.x);
	const ymin = raz(FACTORY_MIN.y);
	const ymax = raz(FACTORY_MAX.y);
	for (let x = xmin; x <= xmax; x += GRID_INC) {
		path.push(`M ${x} ${ymin} l 0 ${ymax - ymin}`);
	}
	for (let y = xmin; y <= ymax; y += GRID_INC) {
		path.push(`M ${xmin} ${y} l ${xmax - xmin} 0`);
	}
	return <path class="backgrid" d={path.join(" ")} />;
})();

function onDrag({ x, y }: Point) {
	update((draft) => {
		const { center, zoom } = draft.viewport;
		const nx = clamp(center.x + x / zoom, FACTORY_MIN.x, FACTORY_MAX.x);
		const ny = clamp(center.y + y / zoom, FACTORY_MIN.y, FACTORY_MAX.y);
		center.x = nx;
		center.y = ny;
	});
	return true;
}

function addRandomProduer(p: Point) {
	const index = Math.floor(Math.random() * Recipes.length);
	const recipe = Recipes[index];
	const producer = new ProductionBuilding(p.x, p.y, BigRat.ONE, recipe);
	update(addProducer(producer));
}

export function FactoryEditor() {
	const producers = useSelector(selectProducerIds);
	const viewport = useSelector((s) => s.viewport);
	const viewportElementRef = useRef<HTMLDivElement | null>(null);
	const svgRef = useRef<SVGSVGElement | null>(null);
	const panStart = useDrag(onDrag);
	const currentScreenCoords = useRef<Point | null>(null);
	const viewportLatest = useLatestValue(viewport);
	useEffect(() => {
		function mouseMove(ev: MouseEvent) {
			currentScreenCoords.current = {
				x: ev.clientX,
				y: ev.clientY,
			};
		}
		function blur() {
			currentScreenCoords.current = null;
		}
		window.addEventListener("blur", blur, { capture: true, passive: true });
		document.addEventListener("mousemove", mouseMove, { capture: true, passive: true });
		return () => {
			window.removeEventListener("blur", blur, { capture: true });
			document.removeEventListener("mousemove", mouseMove, { capture: true });
		};
	}, []);

	function calculateCurrentViewportMousePosition() {
		const screen = currentScreenCoords.current;
		if (!screen) {
			return null;
		}
		const { zoom, center } = viewportLatest.current;

		const screenCenterX = window.innerWidth / 2;
		const screenCenterY = window.innerHeight / 2;

		const sdx = screen.x - screenCenterX;
		const sdy = screen.y - screenCenterY;

		return {
			x: sdx / zoom + center.x,
			y: sdy / zoom + center.y,
		};
	}

	const onMouseDown = (ev: MouseEvent) => {
		if (ev.target === svgRef.current) {
			panStart(ev);
		}
	};

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

	const transform = `transform: translate(-50%, -50%) scale(${viewport.zoom}) ${toTranslation(viewport.center)}`;

	return (
		<div class="viewport" tabIndex={-1} ref={viewportElementRef} onWheelCapture={onWheel}>
			<svg viewBox={viewBox} style={transform} onMouseDown={onMouseDown} ref={svgRef}>
				{backGrid}
				{producers.map((id) => (
					<Producer key={id} id={id} />
				))}
			</svg>
			<div class="actions">
				<KeyButton
					keyName="b"
					onAct={(wasClick) => {
						const p = (!wasClick && calculateCurrentViewportMousePosition()) || viewport.center;
						addRandomProduer(p);
					}}
				>
					Add builder
				</KeyButton>
			</div>
		</div>
	);
}
