import { NodeId, toTranslation } from "./store/Common";
import { update, useSelector } from "./store/Store";
import { MakeBusDrawing } from "./ProducerArt";

import "./Bus.css";

export function Bus({ id }: { id: NodeId }) {
	const bus = useSelector((s) => s.buses.get(id)!);

	const { x1, x2, y } = bus;

	return (
		<g class="bus" style={`transform: ${toTranslation({ x: x1, y })}`}>
			<path
				class="outline"
				d={MakeBusDrawing(bus)}
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
