import { FactoryPlanner } from "./FactoryPlanner";
import { SerializePlanner } from "./SerializePlanner";

export function Planner() {
	return (
		<>
			<FactoryPlanner />
			<SerializePlanner />
		</>
	);
}
