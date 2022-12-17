import { useEffect, useRef } from "preact/hooks";
import { BigRat } from "../math/BigRat";
import { addProducer } from "../store/Actions";
import { Point, SIXTY } from "../store/Common";
import { ProductionBuilding, Sink, Source } from "../store/Producers";
import { getStateRaw, MouseOverObject, selectMouseOverObject, update, useSelector } from "../store/Store";
import { BUILDING_MAX, BUILDING_MIN, clampp } from "../util";
import { chooseItem, chooseRecipeByOutput } from "./ItemChooser";
import { KeyButton } from "./KeyButton";

import "./HotKeyActions.css";

export function HotKeyActions() {
	const currentScreenCoords = useRef<Point | null>(null);
	const currentObject = useSelector(selectMouseOverObject);

	useEffect(() => {
		function mouseMove(ev: MouseEvent) {
			currentScreenCoords.current = {
				x: ev.clientX,
				y: ev.clientY,
			};
		}
		function mouseLeave() {
			currentScreenCoords.current = null;
		}
		document.documentElement.addEventListener("mouseleave", mouseLeave, { passive: true });
		document.addEventListener("mousemove", mouseMove, { capture: true, passive: true });
		return () => {
			window.removeEventListener("blur", mouseLeave, { capture: true });
			document.documentElement.removeEventListener("mouseleave", mouseLeave);
		};
	}, []);

	function calculateActionPosition(wasClick: boolean) {
		const screen = currentScreenCoords.current;
		if (wasClick || !screen) {
			return getStateRaw().viewport.center;
		}
		const { zoom, center } = getStateRaw().viewport;

		const screenCenterX = window.innerWidth / 2;
		const screenCenterY = window.innerHeight / 2;

		const sdx = screen.x - screenCenterX;
		const sdy = screen.y - screenCenterY;

		return {
			x: sdx / zoom - center.x,
			y: sdy / zoom - center.y,
		};
	}

	const actionRender: {
		[K in MouseOverObject["type"]]: (o: MouseOverObject & { type: K }) => preact.ComponentChild;
	} = {
		none: () => {
			return null;
		},
		viewport: () => (
			<>
				<KeyButton
					keyName="b"
					onAct={async (wasClick) => {
						const p = clampp(calculateActionPosition(wasClick), BUILDING_MIN, BUILDING_MAX);
						const recipe = await chooseRecipeByOutput();
						if (recipe) {
							update(addProducer(new ProductionBuilding(p.x, p.y, BigRat.ONE, recipe)));
						}
					}}
				>
					Add builder
				</KeyButton>
				<KeyButton
					keyName="u"
					onAct={async (wasClick) => {
						const p = clampp(calculateActionPosition(wasClick), BUILDING_MIN, BUILDING_MAX);
						const item = await chooseItem("Choose item for source:");
						if (item) {
							update(addProducer(new Source(p.x, p.y, SIXTY, item)));
						}
					}}
				>
					Add source
				</KeyButton>
				<KeyButton
					keyName="k"
					onAct={async (wasClick) => {
						const p = clampp(calculateActionPosition(wasClick), BUILDING_MIN, BUILDING_MAX);
						const item = await chooseItem("Choose item for sink:");
						if (item) {
							update(addProducer(new Sink(p.x, p.y, SIXTY, item)));
						}
					}}
				>
					Add Sink
				</KeyButton>
			</>
		),
		producer: (o) => null,
		"producer:connection:input": (o) => null,
		"producer:connection:output": (o) => null,
	};

	return <div class="hotkey-actions">{actionRender[currentObject.type](currentObject as any)}</div>;
}
