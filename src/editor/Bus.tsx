import { NodeId, toTranslation } from "./store/Common";
import { update, useSelector } from "./store/Store";
import { MakeBusDrawing } from "./ProducerArt";
import { useDrag } from "../hook/drag";
import { BUILDING_MAX, BUILDING_MIN, clamp } from "../util";

import "./Bus.css";

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

	const { x, y, width } = bus;

	return (
		<g class="bus" style={`transform: ${toTranslation(bus)}`}>
			<path
				class="outline"
				d={MakeBusDrawing(bus)}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					dragStart(ev);
				}}
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = {
							type: "bus",
							busId: id,
						};
					})
				}
			/>
		</g>
	);
}
