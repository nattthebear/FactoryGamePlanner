import { NodeId, toTranslation } from "./store/Common";
import { update, useSelector } from "./store/Store";
import { useDrag } from "../hook/drag";
import { BUILDING_MAX, BUILDING_MIN, clamp } from "../util";

import "./Bus.css";

const resizeRect = <rect x={-10} y={-30} width={20} height={60} />;

const MIN_WIDTH = 200;
const MAX_WIDTH = 800;

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

			p.x = ox + (ow - nw) / 2;
			p.width = nw;
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
			style={`transform: ${toTranslation(bus)}`}
			onMouseEnter={() =>
				update((draft) => {
					draft.mouseOver = {
						type: "bus",
						busId: id,
					};
				})
			}
		>
			<path class="mainline" d={`M ${-width / 2} -20 l 0 40 m 0 -20 l ${width} 0 m 0 -20 l 0 40`} />
			<g
				class="resizer"
				style={`transform: translate(-${width / 2}px, 0)`}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					resizeLeft(ev);
				}}
			>
				{resizeRect}
			</g>
			<g
				class="resizer"
				style={`transform: translate(${width / 2}px, 0)`}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					resizeRight(ev);
				}}
			>
				{resizeRect}
			</g>
			<g class="dragger">
				<rect
					x={-width / 2}
					y={-10}
					width={width}
					height={20}
					onMouseDown={(ev) => {
						ev.stopPropagation();
						dragStart(ev);
					}}
				/>
			</g>
		</g>
	);
}