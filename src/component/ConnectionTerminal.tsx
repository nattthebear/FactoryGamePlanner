import { LiquidAttach, ProducerDrawing, SolidAttach } from "../art/Producers";
import { NodeId, toTranslation } from "../store/Common";
import { useSelector } from "../store/Store";

import "./ConnectionTerminal.css";

export function ConnectionTerminal({
	producerId,
	isOutput,
	index,
}: {
	producerId: NodeId;
	isOutput: boolean;
	index: number;
}) {
	const producer = useSelector((s) => s.producers.get(producerId)!);
	let attachPoints: ProducerDrawing["attach"]["input" | "output"];
	{
		const a = producer.getDrawing().attach;
		attachPoints = isOutput ? a.output : a.input;
	}

	const { rate, item } = (isOutput ? producer.outputFlows() : producer.inputFlows())[index];
	const connectionIds = (isOutput ? producer.outputs : producer.inputs)[index];

	const pIndex = (isOutput ? producer.getOutputAttachIndexes() : producer.getInputAttachIndexes())[index];

	const p = attachPoints.either[pIndex] ?? (item.IsPiped ? attachPoints.liquid : attachPoints.solid)[pIndex];
	const d = item.IsPiped ? LiquidAttach : SolidAttach;

	return (
		<g class="connection-terminal" style={`transform: ${toTranslation(p)}`}>
			<path class="outline" fill={item.Color} d={d} />
			<image href={item.Icon} />
		</g>
	);
}
