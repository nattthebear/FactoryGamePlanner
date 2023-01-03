import { NodeId, pointAdd, pointEqual } from "./store/Common";
import { Producer } from "./store/Producers";
import { selectProducerLocation, update, useSelector } from "./store/Store";

import "./Connector.css";

export function Connector({ id }: { id: NodeId }) {
	const connector = useSelector((s) => s.connectors.get(id)!);

	const inputLoc = useSelector(selectProducerLocation(connector.input));
	const inputAttach = useSelector({
		select: (state) => state.producers.get(connector.input)!.outputAttachPoints[connector.inputIndex],
		equal: pointEqual,
	});
	const outputLoc = useSelector(selectProducerLocation(connector.output));
	const outputAttach = useSelector({
		select: (state) => state.producers.get(connector.output)!.inputAttachPoints[connector.outputIndex],
		equal: pointEqual,
	});

	const ip = pointAdd(inputLoc, inputAttach);
	const op = pointAdd(outputLoc, outputAttach);

	const dx = op.x - ip.x;
	const dy = op.y - ip.y;

	let slx = 400;
	if (dx > 0) {
		slx = Math.min(slx, slx * 0.5 * Math.abs(dy / dx));
	}
	const dxc = Math.max(dx * 0.8, slx);

	return (
		<>
			<path
				class="connector"
				d={`M ${ip.x} ${ip.y} c ${dxc} 0 ${dx - dxc} ${dy} ${dx} ${dy}`}
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = {
							type: "connector",
							connectorId: id,
						};
					})
				}
			/>
			<text class="connector-text" x={(op.x + ip.x) / 2} y={(op.y + ip.y) / 2}>
				{connector.rate.toFixed(2)}/min
			</text>
		</>
	);
}
