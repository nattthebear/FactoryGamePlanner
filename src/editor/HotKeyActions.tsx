import { useEffect, useRef } from "preact/hooks";
import { BigRat } from "../math/BigRat";
import {
	addConnector,
	addProducer,
	adjustConnectorClosest,
	emptyToRecipe,
	emptyToSink,
	fillFromRecipe,
	fillFromSource,
	matchBuildingToInput,
	matchBuildingToOutput,
	mergeProducers,
	removeConnector,
	removeProducer,
	splitOffConnectorClosest,
} from "./store/Actions";
import { SIXTY } from "./store/Common";
import { ProductionBuilding, Sink, Source } from "./store/Producers";
import { getStateRaw, MouseOverObject, selectMouseOverObject, update, useSelector, WipInfo } from "./store/Store";
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
import { reflowConnectors } from "./store/ReflowConnector";

export function HotKeyActions() {
	const currentScreenCoords = useRef<Point | null>(null);
	const currentObject = useSelector(selectMouseOverObject);
	const currentWip = useSelector((s) => s.wip);

	useEffect(() => {
		function listener(ev: KeyboardEvent) {
			if (ev.key === "Escape") {
				update((draft) => {
					draft.wip = { type: "none" };
				});
			}
		}
		document.addEventListener("keydown", listener, { passive: true, capture: true });
		return () => {
			document.removeEventListener("keydown", listener, { capture: true });
		};
	}, []);

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
		[K in MouseOverObject["type"]]: (o: MouseOverObject & { type: K }, w: WipInfo) => preact.ComponentChild;
	} = {
		none: () => {
			return null;
		},
		viewport: (o, w) => {
			if (w.type !== "none") {
				return null;
			}
			return (
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
			);
		},
		producer: (o, w) => {
			if (w.type !== "none") {
				if (w.type === "producer:merge") {
					return (
						<KeyButton
							keyName="m"
							onAct={() => {
								if (o.producer.canCombineWith(getStateRaw().producers.get(w.producerId)!)) {
									update((draft) => {
										mergeProducers(o.producer.id, w.producerId)(draft);
										draft.wip = { type: "none" };
									});
								}
							}}
						>
							Finish Merge
						</KeyButton>
					);
				}
				return null;
			}

			return (
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
										reflowConnectors(draft, producer.inputsAndOutputs());
									});
								}
							} else if (producer instanceof Source || producer instanceof Sink) {
								const newRate = await chooseSourceSinkRate(producer);
								if (newRate) {
									update((draft) => {
										draft.producers.get(producer.id)!.rate = newRate;
										reflowConnectors(draft, producer.inputsAndOutputs());
									});
								}
							}
						}}
					>
						Change rate
					</KeyButton>
					<KeyButton
						keyName="m"
						onAct={() => {
							update((draft) => {
								draft.wip = { type: "producer:merge", producerId: o.producer.id };
							});
						}}
					>
						Merge
					</KeyButton>
				</>
			);
		},
		"producer:connection:input": (o, w) => {
			if (w.type !== "none") {
				if (w.type === "connector:input" && w.item === o.flow.item) {
					return (
						<KeyButton
							keyName="c"
							onAct={() => {
								update((draft) => {
									addConnector(
										{ producerId: w.producerId, outputIndex: w.index },
										{ producerId: o.producer.id, inputIndex: o.index },
										"input",
									)(draft);
									draft.wip = { type: "none" };
								});
							}}
						>
							Finish Add Connector
						</KeyButton>
					);
				}
				return null;
			}

			const totalIn = o.connectors.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
			const hasShortfall = totalIn.lt(o.flow.rate);
			return (
				<>
					<KeyButton
						keyName="f"
						// TODO: Is this really needed?
						// disabled={totalIn.eq(o.flow.rate) || totalIn.eq(BigRat.ZERO)}
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
					<KeyButton
						keyName="c"
						onAct={() => {
							update((draft) => {
								draft.wip = {
									type: "connector:output",
									producerId: o.producer.id,
									index: o.index,
									item: o.flow.item,
								};
							});
						}}
					>
						Add Connector
					</KeyButton>
				</>
			);
		},
		"producer:connection:output": (o, w) => {
			if (w.type !== "none") {
				if (w.type === "connector:output" && w.item === o.flow.item) {
					return (
						<KeyButton
							keyName="c"
							onAct={() => {
								update((draft) => {
									addConnector(
										{ producerId: o.producer.id, outputIndex: o.index },
										{ producerId: w.producerId, inputIndex: w.index },
										"output",
									)(draft);
									draft.wip = { type: "none" };
								});
							}}
						>
							Finish Add Connector
						</KeyButton>
					);
				}
				return null;
			}

			const totalOut = o.connectors.reduce((acc, val) => acc.add(val.rate), BigRat.ZERO);
			const hasSurplus = totalOut.lt(o.flow.rate);
			return (
				<>
					<KeyButton
						keyName="f"
						// TODO: Is this really needed?
						// disabled={totalOut.eq(o.flow.rate) || totalOut.eq(BigRat.ZERO)}
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
					<KeyButton
						keyName="c"
						onAct={() => {
							update((draft) => {
								draft.wip = {
									type: "connector:input",
									producerId: o.producer.id,
									index: o.index,
									item: o.flow.item,
								};
							});
						}}
					>
						Add Connector
					</KeyButton>
				</>
			);
		},
		connector: (o, w) => {
			if (w.type !== "none") {
				return null;
			}
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
					<KeyButton
						keyName="s"
						onAct={(wasClick) => {
							const { connector } = o;
							const p = calculateActionPosition(wasClick);
							update(splitOffConnectorClosest(connector.id, p));
						}}
					>
						Split connector off closest building
					</KeyButton>
				</>
			);
		},
	};

	return <div class="hotkey-actions">{actionRender[currentObject.type](currentObject as any, currentWip)}</div>;
}
