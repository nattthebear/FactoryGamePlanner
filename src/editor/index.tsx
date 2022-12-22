import { FactoryEditor } from "./FactoryEditor";
import { PromptRoot } from "./Prompt";
import { SerializePlan } from "./SerializePlan";

export function Editor() {
	return (
		<>
			<FactoryEditor />
			<PromptRoot />
			<SerializePlan />
		</>
	);
}
