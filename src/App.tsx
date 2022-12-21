import { render } from "preact";
import { FactoryEditor } from "./component/FactoryEditor";

import "./App.css";
import { PromptRoot } from "./component/Prompt";
import { SerializePlan } from "./component/SerializePlan";

render(
	<>
		<FactoryEditor />
		<PromptRoot />
		<SerializePlan />
	</>,
	document.getElementById("root")!
);
