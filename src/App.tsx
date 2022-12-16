import { render } from "preact";
import { FactoryEditor } from "./component/FactoryEditor";

import "./App.css";
import { PromptRoot } from "./component/Prompt";

render(
	<>
		<FactoryEditor />
		<PromptRoot />
	</>,
	document.getElementById("root")!
);
