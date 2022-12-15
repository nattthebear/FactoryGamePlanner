import { NodeId } from "../store/Common";
import { useSelector } from "../store/Store";

export function Producer({ id }: { id: NodeId }) {
	const producer = useSelector((s) => s.producers.get(id)!);

	return <g style={`transform: translate(${producer.x}px, ${producer.y}px)`}>{producer.draw()}</g>;
}
