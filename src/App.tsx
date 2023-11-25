import { createRoot, TPC } from "vdomk";
import { Editor } from "./editor";
import { PromptRoot } from "./component/Prompt";
import { AppActions } from "./AppActions";
import { Planner } from "./planner";
import { installTooltip } from "./component/Tooltip";
import { changeInPlanner, useSelector } from "./AppStore";

import "./App.css";

const App: TPC<{}> = (_, instance) => {
	const getInPlanner = useSelector(instance, (s) => s.inPlanner);

	return () => {
		const inPlanner = getInPlanner();

		return (
			<>
				{inPlanner ? <Planner /> : <Editor />}
				<AppActions inPlanner={inPlanner} changeInPlanner={changeInPlanner} />
				<PromptRoot />
			</>
		);
	};
};

installTooltip();
createRoot(document.body, <App />);
