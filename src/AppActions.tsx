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
		<div class="app-actions">
			<KeyButton keyName="F2" disabled={inPlanner} onAct={() => changeInPlanner(true)}>
				Planner
			</KeyButton>
			<KeyButton keyName="F3" disabled={!inPlanner} onAct={() => changeInPlanner(false)}>
				Editor
			</KeyButton>
		</div>
	);
}
