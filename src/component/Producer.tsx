import { useDrag } from "../hook/drag";
import { NodeId, toTranslation } from "../store/Common";
import { update, useSelector } from "../store/Store";
import { BUILDING_MAX, BUILDING_MIN, clamp, FACTORY_MAX, FACTORY_MIN } from "../util";
import { ConnectionTerminal } from "./ConnectionTerminal";

import "./Producer.css";

export function Producer({ id }: { id: NodeId }) {
	const producer = useSelector((s) => s.producers.get(id)!);
	const dragStart = useDrag(({ x, y }) => {
		update((draft) => {
			const { zoom } = draft.viewport;
			const p = draft.producers.get(id)!;
			const { x: ox, y: oy } = p;
			const nx = clamp(ox + x / zoom, BUILDING_MIN.x, BUILDING_MAX.x);
			const ny = clamp(oy + y / zoom, BUILDING_MIN.y, BUILDING_MAX.y);
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
