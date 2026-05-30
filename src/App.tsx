import { createRoot, TPC } from "vdomk";
import { Editor } from "./editor";
import { PromptRoot } from "./component/Prompt";
import { AppActions } from "./AppActions";
import { Planner } from "./planner";
import { installTooltip } from "./component/Tooltip";
import { changeAppTab, useSelector } from "./AppStore";
import { GameMode } from "./gamemode";

import "./App.css";

const App: TPC<{}> = (_, instance) => {
	const getTab = useSelector(instance, (s) => s.inTab);

	return () => {
		const tab = getTab();

		return (
			<>
				{tab === "planner" && <Planner />}
				{tab === "editor" && <Editor />}
				{tab === "gamemode" && <GameMode />}
				<AppActions tab={tab} changeTab={changeAppTab} />
				<PromptRoot />
			</>
		);
	};
};

installTooltip();
createRoot(document.body, <App />);
