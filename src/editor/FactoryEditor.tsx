import { TPC, cleanup } from "vdomk";
import { Recipes } from "../../data/generated/recipes";
import { initiateDrag } from "../hook/drag";
import { BigRat } from "../math/BigRat";
import { addProducer } from "./store/Actions";
import { SIXTY, toTranslation } from "./store/Common";
import { ProductionBuilding, Sink, Source } from "./store/Producers";
import { selectBusIds, selectConnectorIds, selectProducerIds, update, useSelector } from "./store/Store";
import {
	BUILDING_MAX,
	BUILDING_MIN,
	clamp,
	clampp,
	FACTORY_HEIGHT,
	FACTORY_MAX,
	FACTORY_MIN,
	FACTORY_WIDTH,
	Point,
} from "../util";
import { Connector } from "./Connector";
import { createMemo } from "../hook/createMemo";
import { HotKeyActions } from "./HotKeyActions";
import { KeyButton } from "./KeyButton";
import { Producer } from "./Producer";
import { Bus } from "./Bus";

import "./FactoryEditor.css";
import { getMouseLocationOrCenter, getPointerLocationOrCenter } from "./PointerLocation";

const ZOOM_MAX = 5;
const ZOOM_MIN = 1 / 10;
const ZOOM_SPEED = 1.0011;
const ZOOM_KEYBOARD_SPEED = 1.1;

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
	return (
		<>
			<rect x={FACTORY_MIN.x} y={FACTORY_MIN.y} width={FACTORY_WIDTH} height={FACTORY_HEIGHT} />
			<path d={path.join(" ")} />
		</>
	);
})();

function handlePan({ x, y }: Point) {
	update((draft) => {
		const { center, zoom } = draft.viewport;
		const nx = clamp(center.x + x / zoom, FACTORY_MIN.x, FACTORY_MAX.x);
		const ny = clamp(center.y + y / zoom, FACTORY_MIN.y, FACTORY_MAX.y);
		center.x = nx;
		center.y = ny;
	});
	return true;
}

function handleZoom(multiplier: number) {
	update((draft) => {
		const { center, zoom } = draft.viewport;
		let newZoom = zoom * multiplier;
		if (newZoom < ZOOM_MIN) {
			newZoom = ZOOM_MIN;
		}
		if (newZoom > ZOOM_MAX) {
			newZoom = ZOOM_MAX;
		}
		if (newZoom > 0.94 && newZoom < 1.06) {
			newZoom = 1;
		}

		const { x: mx, y: my } = getMouseLocationOrCenter(false);

		draft.viewport.zoom = newZoom;
		const nx = clamp(center.x + mx / newZoom - mx / zoom, FACTORY_MIN.x, FACTORY_MAX.x);
		const ny = clamp(center.y + my / newZoom - my / zoom, FACTORY_MIN.y, FACTORY_MAX.y);
		center.x = nx;
		center.y = ny;
	});
}

export const FactoryEditor: TPC<{}> = (_, instance) => {
	const getProducers = useSelector(instance, selectProducerIds);
	const getConnectors = useSelector(instance, selectConnectorIds);
	const getBuses = useSelector(instance, selectBusIds);
	const getViewport = useSelector(instance, (s) => s.viewport);

	let producers = getProducers();
	let connectors = getConnectors();
	let buses = getBuses();
	let viewport = getViewport();

	const renderProducerComponents = createMemo(
		(producers) => producers.map((id) => <Producer key={id as any as number} id={id} />),
		() => producers,
	);
	const renderConnectorComponents = createMemo(
		(connectors) => connectors.map((id) => <Connector key={id as any as number} id={id} />),
		() => connectors,
	);
	const renderBusComponents = createMemo(
		(buses) => buses.map((id) => <Bus key={id as any as number} id={id} />),
		() => buses,
	);

	function onWheel(ev: WheelEvent) {
		ev.preventDefault();
		handleZoom(ZOOM_SPEED ** -ev.deltaY);
	}

	{
		function zoomListener(ev: KeyboardEvent) {
			if (ev.key === "PageUp") {
				handleZoom(ZOOM_KEYBOARD_SPEED);
			} else if (ev.key === "PageDown") {
				handleZoom(1 / ZOOM_KEYBOARD_SPEED);
			}
		}
		document.addEventListener("keydown", zoomListener, { passive: true, capture: true });
		cleanup(instance, () => {
			document.removeEventListener("keydown", zoomListener, { capture: true });
		});
	}

	return () => {
		producers = getProducers();
		connectors = getConnectors();
		buses = getBuses();
		viewport = getViewport();

		const transform = `transform: translate(-50%, -50%) scale(${viewport.zoom}) ${toTranslation(viewport.center)}`;

		return (
			<div class="viewport" tabIndex={-1} onWheelCapture={onWheel}>
				<svg viewBox={viewBox} style={transform}>
					<g
						class="backgrid"
						onMouseDown={(ev) => initiateDrag(ev, handlePan)}
						onMouseEnter={() =>
							update((draft) => {
								draft.mouseOver = { type: "viewport" };
							})
						}
					>
						{backGrid}
					</g>
					{renderConnectorComponents()}
					{renderBusComponents()}
					{renderProducerComponents()}
				</svg>
				<HotKeyActions />
			</div>
		);
	};
};
