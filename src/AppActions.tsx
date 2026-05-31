import "./AppActions.css";
import { AppTab } from "./AppStore";
import { runCalculator } from "./component/Calculator";
import { KeyButton } from "./editor/KeyButton";

export function AppActions({ tab, changeTab }: { tab: AppTab; changeTab: (newValue: AppTab) => void }) {
	return (
		<div class="app-actions key-actions">
			<KeyButton keyName="q" disabled={tab === "planner"} onAct={() => changeTab("planner")}>
				Planner
			</KeyButton>
			<KeyButton keyName="w" disabled={tab === "editor"} onAct={() => changeTab("editor")}>
				Editor
			</KeyButton>
			<KeyButton keyName="y" disabled={tab === "gamemode"} onAct={() => changeTab("gamemode")}>
				Settings
			</KeyButton>
			<KeyButton keyName="e" onAct={runCalculator}>
				Calculator
			</KeyButton>
			<button onClick={() => window.open("https://github.com/nattthebear/FactoryGamePlanner#readme", "_blank")}>
				Help
			</button>
		</div>
	);
}
