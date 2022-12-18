import { LiquidAttach, ProducerDrawing, SolidAttach } from "../art/Producers";
import { NodeId, toTranslation } from "../store/Common";
import { update, useSelector } from "../store/Store";

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
	const { rate, item } = (isOutput ? producer.outputFlows() : producer.inputFlows())[index];
	const connectionIds = (isOutput ? producer.outputs : producer.inputs)[index];

	const p = (isOutput ? producer.outputAttachPoints : producer.inputAttachPoints)[index];
	const d = item.IsPiped ? LiquidAttach : SolidAttach;

	return (
		<g
			class="connection-terminal"
			style={`transform: ${toTranslation(p)}`}
			onMouseEnter={() =>
				update((draft) => {
					draft.mouseOver = {
						type: isOutput ? "producer:connection:output" : "producer:connection:input",
						producerId,
						index,
					};
				})
			}
		>
			<path class="outline" fill={item.Color} d={d} />
			<image href={item.Icon} />
		</g>
	);
}
