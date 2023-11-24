import { TPC } from "vdomk";
import { NodeId, toTranslation } from "./store/Common";
import { State, update, useSelector } from "./store/Store";
import { initiateDrag } from "../hook/drag";
import { BUILDING_MAX, BUILDING_MIN, clamp } from "../util";
import { BigRat } from "../math/BigRat";
import { BusTerminal, findTerminalIndex } from "./store/Bus";

import "./Bus.css";
import { SelectorEq } from "../MakeStore";

const resizeRect = <rect x={-10} y={-30} width={20} height={60} />;

const MIN_WIDTH = 200;
const MAX_WIDTH = 8000;

const MAX_FLOW = BigRat.fromInteger(780);

interface RateDiff {
	x: number;
	rate: BigRat;
}

function compareRateDiffs(a: RateDiff, b: RateDiff) {
	return a.x - b.x;
}

const selectRateDiffs: (id: NodeId) => SelectorEq<State, RateDiff[]> = (id) => ({
	select(state) {
		const bus = state.buses.get(id)!;
		const ret: RateDiff[] = [];
		for (const { rxIn, rxOut, id: cId } of bus.terminals) {
			const rate = state.connectors.get(cId)!.rate;
			ret.push({ x: rxIn, rate });
			ret.push({ x: rxOut, rate: rate.neg() });
		}
		ret.sort(compareRateDiffs);
		return ret;
	},
	equal(x, y) {
		const { length } = x;
		if (length !== y.length) {
			return false;
		}
		for (let i = 0; i < length; i++) {
			const xElt = x[i];
			const yElt = y[i];
			if (xElt.x !== yElt.x || !xElt.rate.eq(yElt.rate)) {
				return false;
			}
		}
		return true;
	},
});

export const Bus: TPC<{ id: NodeId }> = ({ id }, instance) => {
	const getBus = useSelector(instance, (s) => s.buses.get(id)!);
	const getRateDiffs = useSelector(instance, selectRateDiffs(id));

	return () => {
		const bus = getBus();
		const rateDiffs = getRateDiffs();
		const { x, y, width } = bus;

		let runningRate = BigRat.ZERO;

		return (
			<g
				class="bus"
				style={`transform: translate(${x - bus.width / 2}px, ${y}px)`}
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = {
							type: "bus",
							busId: id,
						};
					})
				}
			>
				<path class="mainline" d={`M 0 -20 l 0 40 m 0 -20 l ${width} 0 m 0 -20 l 0 40`} />
				{rateDiffs.map(({ x, rate }, index) => {
					const xNext = rateDiffs[index + 1]?.x;
					if (xNext != null) {
						const netRate = (runningRate = runningRate.add(rate));
						return (
							<>
								{netRate.gt(MAX_FLOW) && <path class="rate-over" d={`M ${x} 0 L ${xNext} 0`} />}
								<text x={(x + xNext) / 2} class="rate-text">
									{netRate.toStringAdaptive()}/min
								</text>
							</>
						);
					}
				})}
				<g class="dragger">
					<rect
						x={0}
						y={-10}
						width={width}
						height={20}
						onMouseDown={(ev) =>
							initiateDrag(ev, ({ x, y }) => {
								update((draft) => {
									const { zoom } = draft.viewport;
									const p = draft.buses.get(id)!;
									const { x: ox, y: oy } = p;
									const nx = clamp(ox + x / zoom, BUILDING_MIN.x, BUILDING_MAX.x);
									const ny = clamp(oy + y / zoom, BUILDING_MIN.y, BUILDING_MAX.y);
									p.x = nx;
									p.y = ny;
								});
								return true;
							})
						}
					/>
				</g>
				<g
					class="resizer"
					onMouseDown={(ev) =>
						initiateDrag(ev, ({ x }) => {
							update((draft) => {
								const { zoom } = draft.viewport;
								const p = draft.buses.get(id)!;
								const { x: ox, width: ow } = p;
								const rxInMin = p.terminals.reduce((acc, { rxIn }) => Math.min(acc, rxIn), 9999999);
								const nw = clamp(ow - x / zoom, Math.max(MIN_WIDTH, ow - rxInMin), MAX_WIDTH);
								const dw = ow - nw;

								p.x = ox + dw / 2;
								p.width = nw;
								for (const t of p.terminals) {
									t.rxIn -= dw;
									t.rxOut -= dw;
								}
							});
							return true;
						})
					}
				>
					{resizeRect}
				</g>
				<g
					class="resizer"
					style={`transform: translate(${width}px)`}
					onMouseDown={(ev) =>
						initiateDrag(ev, ({ x }) => {
							update((draft) => {
								const { zoom } = draft.viewport;
								const p = draft.buses.get(id)!;
								const { x: ox, width: ow } = p;
								const rxOutMax = p.terminals.reduce(
									(acc, { rxOut }) => Math.max(acc, rxOut),
									MIN_WIDTH,
								);
								const nw = clamp(ow + x / zoom, rxOutMax, MAX_WIDTH);

								p.x = ox + (nw - ow) / 2;
								p.width = nw;
							});
							return true;
						})
					}
				>
					{resizeRect}
				</g>
				{bus.terminals.map((terminal, index) => (
					<g
						class="resizer"
						style={`transform: translate(${terminal.rxIn}px)`}
						onMouseDown={(ev) =>
							initiateDrag(ev, ({ x }) => {
								update((draft) => {
									const { zoom } = draft.viewport;
									const p = draft.buses.get(id)!;
									const { terminals } = p;
									const draftTerminal = terminals[index];
									const nx = clamp(draftTerminal.rxIn + x / zoom, 0, draftTerminal.rxOut);

									let newIndex = findTerminalIndex(terminals, nx);
									if (newIndex > index) {
										newIndex--;
									}
									if (newIndex < index) {
										for (let i = index; i > newIndex; ) {
											terminals[i] = terminals[--i];
										}
										terminals[newIndex] = draftTerminal;
									} else if (newIndex > index) {
										for (let i = index; i < newIndex; ) {
											terminals[i] = terminals[++i];
										}
										terminals[newIndex] = draftTerminal;
									}

									draftTerminal.rxIn = nx;
									index = newIndex;
								});
								return true;
							})
						}
					>
						{resizeRect}
					</g>
				))}
				{bus.terminals.map((terminal, index) => (
					<g
						class="resizer"
						style={`transform: translate(${terminal.rxOut}px)`}
						onMouseDown={(ev) =>
							initiateDrag(ev, ({ x }) => {
								update((draft) => {
									const { zoom } = draft.viewport;
									const p = draft.buses.get(id)!;
									const draftTerminal = p.terminals[index];
									const nx = clamp(draftTerminal.rxOut + x / zoom, draftTerminal.rxIn, p.width);
									draftTerminal.rxOut = nx;
								});
								return true;
							})
						}
					>
						{resizeRect}
					</g>
				))}
			</g>
		);
	};
};
