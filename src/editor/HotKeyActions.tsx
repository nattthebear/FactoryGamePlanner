import { TPC, VNode, cleanup, effect } from "vdomk";
import { BigRat } from "../math/BigRat";
import {
	addBus,
	addConnector,
	addProducer,
	adjustConnectorClosest,
	connectConnectorToBus,
	emptyToRecipe,
	emptyToSink,
	fillFromRecipe,
	fillFromSource,
	matchBuildingToInput,
	matchBuildingToOutput,
	mergeProducers,
	removeBus,
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
import { chooseBuildingRate, chooseSourceSinkRate } from "../component/RateChoser";
import { reflowConnectors } from "./store/ReflowConnector";
import { Bus } from "./store/Bus";
import { getPointerLocationOrCenter } from "./PointerLocation";

import "./HotKeyActions.css";

export const HotKeyActions: TPC<{}> = (_, instance) => {
	const getCurrentObject = useSelector(instance, selectMouseOverObject);
	const getCurrentWip = useSelector(instance, (s) => s.wip);
	const getWipConnectorPiped = useSelector(
		instance,
		(s) => s.wip.type === "connector:bus" && s.connectors.get(s.wip.connectorId)!.item.IsPiped,
	);

	{
		function escapeListener(ev: KeyboardEvent) {
			if (ev.key === "Escape") {
				update((draft) => {
					draft.wip = { type: "none" };
				});
			}
		}
		document.addEventListener("keydown", escapeListener, { passive: true, capture: true });
		cleanup(instance, () => {
			document.removeEventListener("keydown", escapeListener, { capture: true });
		});
	}

	const actionRender: {
		[K in MouseOverObject["type"]]: (
			o: MouseOverObject & { type: K },
			w: WipInfo,
			wipConnectorPiped: boolean,
		) => VNode;
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
							const p = clampp(getPointerLocationOrCenter(wasClick), BUILDING_MIN, BUILDING_MAX);
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
							const p = clampp(getPointerLocationOrCenter(wasClick), BUILDING_MIN, BUILDING_MAX);
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
							const p = clampp(getPointerLocationOrCenter(wasClick), BUILDING_MIN, BUILDING_MAX);
							const item = await chooseItem("Choose item for sink:");
							if (item) {
								update(addProducer(new Sink(p.x, p.y, SIXTY, item)));
							}
						}}
					>
						Add Sink
					</KeyButton>
					<KeyButton
						keyName="s"
						onAct={(wasClick) => {
							const p = clampp(getPointerLocationOrCenter(wasClick), BUILDING_MIN, BUILDING_MAX);
							const INITIAL_WIDTH = 300;
							const bus = new Bus(p.x, p.y, INITIAL_WIDTH);
							update(addBus(bus));
						}}
					>
						Add Bus
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
						onAct={() => {
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
				if (w.type === "bus:connector") {
					return (
						<KeyButton
							keyName="n"
							disabled={!!o.bus}
							onAct={() => update(connectConnectorToBus(o.connector.id, w.busId))}
						>
							Finish Connect to Bus
						</KeyButton>
					);
				}
				return null;
			}
			return (
				<>
					<KeyButton
						keyName="x"
						onAct={() => {
							const { connector, bus } = o;
							update((draft) => {
								if (bus) {
									const { terminals } = draft.buses.get(bus.id)!;
									terminals.splice(
										terminals.findIndex((t) => t.id === connector.id),
										1,
									);
								}
								removeConnector(connector.id)(draft);
							});
						}}
					>
						Remove Connection
					</KeyButton>
					<KeyButton
						keyName="f"
						onAct={(wasClick) => {
							const { connector } = o;
							const p = getPointerLocationOrCenter(wasClick);
							update(adjustConnectorClosest(connector.id, p));
						}}
					>
						Match rate of closest connection
					</KeyButton>
					<KeyButton
						keyName="s"
						onAct={(wasClick) => {
							const { connector } = o;
							const p = getPointerLocationOrCenter(wasClick);
							update(splitOffConnectorClosest(connector.id, p));
						}}
					>
						Split connector off closest building
					</KeyButton>
					<KeyButton
						keyName="n"
						disabled={o.connector.item.IsPiped}
						onAct={() => {
							const { connector } = o;
							update((draft) => {
								if (o.bus) {
									const { terminals } = draft.buses.get(o.bus.id)!;
									terminals.splice(
										terminals.findIndex((t) => t.id === connector.id),
										1,
									);
								} else {
									draft.wip = { type: "connector:bus", connectorId: connector.id };
								}
							});
						}}
					>
						{o.bus ? "Disconnect from bus" : "Connect to Bus"}
					</KeyButton>
				</>
			);
		},
		bus: (o, w, wipConnectorPiped) => {
			if (w.type !== "none") {
				if (w.type === "connector:bus") {
					return (
						<KeyButton
							keyName="n"
							disabled={wipConnectorPiped}
							onAct={() => update(connectConnectorToBus(w.connectorId, o.bus.id))}
						>
							Finish Connect to Connector
						</KeyButton>
					);
				}
				return null;
			}
			return (
				<>
					<KeyButton
						keyName="x"
						onAct={() => {
							const { bus } = o;
							update(removeBus(bus.id));
						}}
					>
						Remove Bus
					</KeyButton>
					<KeyButton
						keyName="n"
						onAct={() => {
							const { bus } = o;
							update((draft) => {
								draft.wip = { type: "bus:connector", busId: bus.id };
							});
						}}
					>
						Connect to Connector
					</KeyButton>
				</>
			);
		},
	};

	return () => {
		const currentObject = getCurrentObject();
		const currentWip = getCurrentWip();
		const wipConnectorPiped = getWipConnectorPiped();

		return (
			<div class="hotkey-actions key-actions">
				{actionRender[currentObject.type](currentObject as any, currentWip, wipConnectorPiped)}
			</div>
		);
	};
};
