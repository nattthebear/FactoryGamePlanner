import { TPC } from "vdomk";
import { NodeId, pointAdd, pointEqual } from "./store/Common";
import { Producer } from "./store/Producers";
import {
	selectConnectorBusTerminal,
	selectConnectorInputLocation,
	selectConnectorOutputLocation,
	update,
	useSelector,
} from "./store/Store";

import "./Connector.css";
import { Point } from "../util";

export const Connector: TPC<{ id: NodeId }> = ({ id }, instance) => {
	const getConnector = useSelector(instance, (s) => s.connectors.get(id)!);
	const getBusLoc = useSelector(instance, selectConnectorBusTerminal(id));
	const getIp = useSelector(instance, selectConnectorInputLocation(id));
	const getOp = useSelector(instance, selectConnectorOutputLocation(id));

	return () => {
		const connector = getConnector();
		const busLoc = getBusLoc();
		const ip = getIp();
		const op = getOp();

		if (busLoc) {
			function renderPath(p1: Point, d1: Point, p2: Point, d2: Point) {
				const tx = 0.125 * p1.x + 0.375 * (p1.x + d1.x) + 0.375 * (p2.x + d2.x) + 0.125 * p2.x;
				const ty = 0.125 * p1.y + 0.375 * (p1.y + d1.y) + 0.375 * (p2.y + d2.y) + 0.125 * p2.y;

				return (
					<>
						<path
							class="connector"
							d={`M ${p1.x} ${p1.y} C ${p1.x + d1.x} ${p1.y + d1.y} ${p2.x + d2.x} ${p2.y + d2.y} ${
								p2.x
							} ${p2.y}`}
						/>
						<text class="connector-text" x={tx} y={ty}>
							{connector.rate.toStringAdaptive()}/min
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
						{connector.rate.toStringAdaptive()}/min
					</text>
				</>
			);
		}
	};
};
