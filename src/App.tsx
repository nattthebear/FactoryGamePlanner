import { render } from "preact";
import { FactoryEditor } from "./component/FactoryEditor";

import "./App.css";
import { PromptRoot } from "./component/Prompt";
import { SerializePlan } from "./component/SerializePlan";
import { test, test2, test3 } from "./solver/Solution";

render(
	<>
		<FactoryEditor />
		<PromptRoot />
		<SerializePlan />
	</>,
	document.getElementById("root")!
);

window.___zzz1 = test;
window.___zzz2 = test2;
window.___zzz3 = test3;
