import { useDrag } from "../hook/drag";
import { NodeId, toTranslation } from "../store/Common";
import { update, useSelector } from "../store/Store";
import { clamp, FACTORY_MAX, FACTORY_MIN } from "../util";
import { ConnectionTerminal } from "./ConnectionTerminal";

import "./Producer.css";

const BUILDING_BORDER = 500;
const MIN = { x: FACTORY_MIN.x + BUILDING_BORDER, y: FACTORY_MIN.y + BUILDING_BORDER };
const MAX = { x: FACTORY_MAX.x - BUILDING_BORDER, y: FACTORY_MAX.y - BUILDING_BORDER };

export function Producer({ id }: { id: NodeId }) {
	const producer = useSelector((s) => s.producers.get(id)!);
	const dragStart = useDrag(({ x, y }) => {
		update((draft) => {
			const { zoom } = draft.viewport;
			const p = draft.producers.get(id)!;
			const { x: ox, y: oy } = p;
			const nx = clamp(ox + x / zoom, MIN.x, MAX.x);
			const ny = clamp(oy + y / zoom, MIN.y, MAX.y);
			p.x = nx;
			p.y = ny;
		});
		return true;
	});

	const drawing = producer.getDrawing();

	return (
		<g class="producer" style={`transform: ${toTranslation(producer)}`}>
			<path
				class="outline"
				d={drawing.d}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					dragStart(ev);
				}}
			/>
			{producer.inputs.map((_, i) => (
				<ConnectionTerminal key={i} producerId={id} isOutput={false} index={i} />
			))}
			{producer.outputs.map((_, i) => (
				<ConnectionTerminal key={i} producerId={id} isOutput={true} index={i} />
			))}
		</g>
	);
}
