import { useDrag } from "../hook/drag";
import { NodeId, toTranslation } from "./store/Common";
import { ProductionBuilding } from "./store/Producers";
import { update, useSelector } from "./store/Store";
import { BUILDING_MAX, BUILDING_MIN, clamp, FACTORY_MAX, FACTORY_MIN } from "../util";
import { ConnectionTerminal } from "./ConnectionTerminal";

import "./Producer.css";

export function Producer({ id }: { id: NodeId }) {
	const producer = useSelector((s) => s.producers.get(id)!);
	const activeMergeAttempt = useSelector((s) => {
		if (s.wip.type !== "producer:merge") {
			return null;
		}
		const other = s.producers.get(s.wip.producerId)!;
		if (other === producer) {
			return "self";
		}
		return other.canCombineWith(producer);
	});

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

	const rateText =
		producer instanceof ProductionBuilding ? (
			<text class="multiplier">{producer.rate.toFixed(2)}x</text>
		) : (
			<text class="rate">{producer.rate.toFixed(2)}/min</text>
		);

	return (
		<g class="producer" style={`transform: ${toTranslation(producer)}`}>
			<path
				class={
					activeMergeAttempt === true
						? "outline merging-yes"
						: activeMergeAttempt === false
						? "outline merging-no"
						: activeMergeAttempt === "self"
						? "outline merging-self"
						: "outline"
				}
				d={drawing.d}
				onMouseDown={(ev) => {
					ev.stopPropagation();
					dragStart(ev);
				}}
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = { type: "producer", producerId: id };
					})
				}
			/>
			{rateText}
			{producer.inputs.map((_, i) => (
				<ConnectionTerminal key={i} producerId={id} isOutput={false} index={i} />
			))}
			{producer.outputs.map((_, i) => (
				<ConnectionTerminal key={i} producerId={id} isOutput={true} index={i} />
			))}
		</g>
	);
}
