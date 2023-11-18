import { NodeId, toTranslation } from "./store/Common";
import { update, useSelector } from "./store/Store";
import { initiateDrag, useDrag } from "../hook/drag";
import { BUILDING_MAX, BUILDING_MIN, clamp } from "../util";

import "./Bus.css";

const resizeRect = <rect x={-10} y={-30} width={20} height={60} />;

const MIN_WIDTH = 200;
const MAX_WIDTH = 2000;

export function Bus({ id }: { id: NodeId }) {
	const bus = useSelector((s) => s.buses.get(id)!);

	const dragStart = useDrag(({ x, y }) => {
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
	});

	const resizeLeft = useDrag(({ x, y }) => {
		update((draft) => {
			const { zoom } = draft.viewport;
			const p = draft.buses.get(id)!;
			const { x: ox, width: ow } = p;
			const nw = clamp(ow - x / zoom, MIN_WIDTH, MAX_WIDTH);
			const dw = ow - nw;

			p.x = ox + dw / 2;
			p.width = nw;
			for (const t of p.terminals) {
				t.rxIn -= dw;
				t.rxOut -= dw;
			}
		});
		return true;
	});

	const resizeRight = useDrag(({ x, y }) => {
		update((draft) => {
			const { zoom } = draft.viewport;
			const p = draft.buses.get(id)!;
			const { x: ox, width: ow } = p;
			const nw = clamp(ow + x / zoom, MIN_WIDTH, MAX_WIDTH);

			p.x = ox + (nw - ow) / 2;
			p.width = nw;
		});
		return true;
	});

	const { x, y, width } = bus;

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
			<g class="dragger">
				<rect
					x={0}
					y={-10}
					width={width}
					height={20}
					onMouseDown={(ev) => {
						ev.stopPropagation();
						dragStart(ev);
					}}
				/>
			</g>
			<g
				class="resizer"
				onMouseDown={(ev) => {
					ev.stopPropagation();
					resizeLeft(ev);
				}}
			>
				{resizeRect}
			</g>
			<g
				class="resizer"
				style={`transform: translate(${width}px)`}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					resizeRight(ev);
				}}
			>
				{resizeRect}
			</g>
			{bus.terminals.map((terminal, index) => (
				<g
					class="resizer"
					style={`transform: translate(${terminal.rxIn}px)`}
					onMouseDown={(ev) => {
						ev.stopPropagation();
						initiateDrag(ev, ({ x }) => {
							update((draft) => {
								const { zoom } = draft.viewport;
								const p = draft.buses.get(id)!;
								const draftTerminal = p.terminals[index];
								const nx = clamp(draftTerminal.rxIn + x / zoom, 0, draftTerminal.rxOut);
								draftTerminal.rxIn = nx;
							});
							return true;
						});
					}}
				>
					{resizeRect}
				</g>
			))}
			{bus.terminals.map((terminal, index) => (
				<g
					class="resizer"
					style={`transform: translate(${terminal.rxOut}px)`}
					onMouseDown={(ev) => {
						ev.stopPropagation();
						initiateDrag(ev, ({ x }) => {
							update((draft) => {
								const { zoom } = draft.viewport;
								const p = draft.buses.get(id)!;
								const draftTerminal = p.terminals[index];
								const nx = clamp(draftTerminal.rxOut + x / zoom, draftTerminal.rxIn, p.width);
								draftTerminal.rxOut = nx;
							});
							return true;
						});
					}}
				>
					{resizeRect}
				</g>
			))}
		</g>
	);
}
