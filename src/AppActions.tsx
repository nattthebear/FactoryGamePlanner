import "./AppActions.css";
import { runCalculator } from "./component/Calculator";
import { KeyButton } from "./editor/KeyButton";

export function AppActions({
	inPlanner,
	changeInPlanner,
}: {
	inPlanner: boolean;
	changeInPlanner: (newValue: boolean) => void;
}) {
	return (
		<div class="app-actions key-actions">
			<KeyButton keyName="q" disabled={inPlanner} onAct={() => changeInPlanner(true)}>
				Planner
			</KeyButton>
			<KeyButton keyName="w" disabled={!inPlanner} onAct={() => changeInPlanner(false)}>
				Editor
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
