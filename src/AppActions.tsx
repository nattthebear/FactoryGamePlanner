import "./AppActions.css";
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
			<button onClick={() => window.open("https://github.com/nattthebear/FactoryGamePlanner#readme", "_blank")}>
				Help
			</button>
		</div>
	);
}
