import { useEffect, useRef } from "preact/hooks";
import { BigRat } from "../math/BigRat";
import {
	addProducer,
	adjustConnectorClosest,
	emptyToRecipe,
	emptyToSink,
	fillFromRecipe,
	fillFromSource,
	matchBuildingToInput,
	matchBuildingToOutput,
	removeConnector,
	removeProducer,
} from "./store/Actions";
import { SIXTY } from "./store/Common";
import { ProductionBuilding, Sink, Source } from "./store/Producers";
import { getStateRaw, MouseOverObject, selectMouseOverObject, update, useSelector } from "./store/Store";
import { BUILDING_MAX, BUILDING_MIN, clampp, Point } from "../util";
import {
	canChooseRecipeForInput,
	canChooseRecipeForOutput,
	chooseItem,
	chooseRecipeByOutput,
	chooseRecipeForInput,
	chooseRecipeForOutput,
} from "../component/ItemChooser";
import { KeyButton } from "./KeyButton";

import "./HotKeyActions.css";
import { chooseBuildingRate, chooseSourceSinkRate } from "../component/RateChoser";

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
		producer: (o) => (
			<>
				<KeyButton
					keyName="x"
					onAct={async () => {
						const { producer } = o;
						update(removeProducer(producer.id));
					}}
				>
					Remove Building
				</KeyButton>
				<KeyButton
					keyName="r"
					onAct={async () => {
						const { producer } = o;
						if (producer instanceof ProductionBuilding) {
							const newRate = await chooseBuildingRate(producer);
							if (newRate) {
								update((draft) => {
									draft.producers.get(producer.id)!.rate = newRate;
								});
							}
						} else if (producer instanceof Source || producer instanceof Sink) {
							const newRate = await chooseSourceSinkRate(producer);
							if (newRate) {
								update((draft) => {
									draft.producers.get(producer.id)!.rate = newRate;
								});
							}
						}
					}}
				>
					Change rate
				</KeyButton>
			</>
		),
		"producer:connection:input": (o) => {
			const totalIn = o.connectors.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
			const hasShortfall = totalIn.lt(o.flow.rate);
			return (
				<>
					<KeyButton
						keyName="f"
						disabled={totalIn.eq(o.flow.rate) || totalIn.eq(BigRat.ZERO)}
						onAct={() => {
							update(matchBuildingToInput(o.producer.id, o.index));
						}}
					>
						Match rate of input connections
					</KeyButton>
					<KeyButton
						keyName="b"
						disabled={!hasShortfall || !canChooseRecipeForOutput(o.flow.item)}
						onAct={async () => {
							const recipe = await chooseRecipeForOutput(o.flow.item);
							if (recipe) {
								update(fillFromRecipe(o.producer.id, o.index, recipe));
							}
						}}
					>
						Balance rates with new building
					</KeyButton>
					<KeyButton
						keyName="u"
						disabled={!hasShortfall}
						onAct={() => {
							update(fillFromSource(o.producer.id, o.index));
						}}
					>
						Balance rates with new source
					</KeyButton>
				</>
			);
		},
		"producer:connection:output": (o) => {
			const totalOut = o.connectors.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
			const hasSurplus = totalOut.lt(o.flow.rate);
			return (
				<>
					<KeyButton
						keyName="f"
						disabled={totalOut.eq(o.flow.rate) || totalOut.eq(BigRat.ZERO)}
						onAct={() => {
							update(matchBuildingToOutput(o.producer.id, o.index));
						}}
					>
						Match rate of output connections
					</KeyButton>
					<KeyButton
						keyName="b"
						disabled={!hasSurplus || !canChooseRecipeForInput(o.flow.item)}
						onAct={async () => {
							const recipe = await chooseRecipeForInput(o.flow.item);
							if (recipe) {
								update(emptyToRecipe(o.producer.id, o.index, recipe));
							}
						}}
					>
						Balance rates with new building
					</KeyButton>
					<KeyButton
						keyName="k"
						disabled={!hasSurplus}
						onAct={() => {
							update(emptyToSink(o.producer.id, o.index));
						}}
					>
						Balance rates with new sink
					</KeyButton>
				</>
			);
		},
		connector: (o) => {
			return (
				<>
					<KeyButton
						keyName="x"
						onAct={async () => {
							const { connector } = o;
							update(removeConnector(connector.id));
						}}
					>
						Remove Connection
					</KeyButton>
					<KeyButton
						keyName="f"
						onAct={(wasClick) => {
							const { connector } = o;
							const p = calculateActionPosition(wasClick);
							update(adjustConnectorClosest(connector.id, p));
						}}
					>
						Match rate of closest connection
					</KeyButton>
				</>
			);
		},
	};

	return <div class="hotkey-actions">{actionRender[currentObject.type](currentObject as any)}</div>;
}
