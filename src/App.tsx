import { render } from "preact";
import { Editor } from "./editor";
import { PromptRoot } from "./component/Prompt";
import { getActiveTabFromSearch, TAB_EDITOR, TAB_PLANNER } from "./base64";
import { useState } from "preact/hooks";
import { AppActions } from "./AppActions";
import { Planner } from "./planner";
import { installTooltip } from "./component/Tooltip";

import "./App.css";

function App() {
	const [inPlanner, changeInPlanner] = useState(() => (getActiveTabFromSearch() === TAB_EDITOR ? false : true));

	return (
		<>
			{inPlanner ? <Planner /> : <Editor />}
			<AppActions inPlanner={inPlanner} changeInPlanner={changeInPlanner} />
			<PromptRoot />
		</>
	);
}

installTooltip();
render(<App />, document.getElementById("root")!);
