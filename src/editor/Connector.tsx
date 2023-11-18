import { NodeId, pointAdd, pointEqual } from "./store/Common";
import { Producer } from "./store/Producers";
import { selectConnectorBusTerminal, selectProducerLocation, update, useSelector } from "./store/Store";

import "./Connector.css";
import { Point } from "../util";

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
	const busLoc = useSelector(selectConnectorBusTerminal(id));

	const ip = pointAdd(inputLoc, inputAttach);
	const op = pointAdd(outputLoc, outputAttach);

	if (busLoc) {
		function renderPath(p1: Point, d1: Point, p2: Point, d2: Point) {
			const tx = 0.125 * p1.x + 0.375 * (p1.x + d1.x) + 0.375 * (p2.x + d2.x) + 0.125 * p2.x;
			const ty = 0.125 * p1.y + 0.375 * (p1.y + d1.y) + 0.375 * (p2.y + d2.y) + 0.125 * p2.y;

			return (
				<>
					<path
						class="connector"
						d={`M ${p1.x} ${p1.y} C ${p1.x + d1.x} ${p1.y + d1.y} ${p2.x + d2.x} ${p2.y + d2.y} ${p2.x} ${
							p2.y
						}`}
					/>
					<text class="connector-text" x={tx} y={ty}>
						{connector.rate.toFixed(2)}/min
					</text>
				</>
			);
		}

		const bi = busLoc.in;
		const bo = busLoc.out;

		return (
			<g
				onMouseEnter={() =>
					update((draft) => {
						draft.mouseOver = {
							type: "connector",
							connectorId: id,
						};
					})
				}
			>
				{renderPath(ip, { x: 200, y: 0 }, bi, { x: 0, y: Math.sign(ip.y - bi.y) * 200 })}
				{renderPath(op, { x: -200, y: 0 }, bo, { x: 0, y: Math.sign(op.y - bo.y) * 200 })}
			</g>
		);
	} else {
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
}
