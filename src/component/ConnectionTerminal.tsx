import { LiquidAttach, ProducerDrawing, SolidAttach } from "../art/Producers";
import { BigRat } from "../math/BigRat";
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
	const connectionSum = useSelector((s) =>
		connectionIds.reduce((acc, val) => acc.add(s.connectors.get(val)!.rate), BigRat.ZERO)
	);

	let diff = rate.sub(connectionSum);
	if (!isOutput) {
		diff = diff.neg();
	}
	const cmp = diff.sign();
	let cmpClass: string;
	if (cmp > 0) {
		cmpClass = "surplus";
	} else if (cmp < 0) {
		cmpClass = "shortfall";
	} else {
		cmpClass = "exact";
	}

	const p = (isOutput ? producer.outputAttachPoints : producer.inputAttachPoints)[index];
	const d = item.IsPiped ? LiquidAttach : SolidAttach;

	return (
		<g
			class={`connection-terminal ${cmpClass}`}
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
			<path class="outline" d={d} />
			<image href={item.Icon} />
			{cmp !== 0 && (
				<text>
					{cmp > 0 && "+"}
					{diff.toNumberApprox().toFixed(0)}/min
				</text>
			)}
		</g>
	);
}
