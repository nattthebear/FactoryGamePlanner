import { render } from "preact";
import { Editor } from "./editor";
import { PromptRoot } from "./component/Prompt";
import { useState } from "preact/hooks";
import { AppActions } from "./AppActions";
import { Planner } from "./planner";
import { installTooltip } from "./component/Tooltip";

import "./App.css";
import { makeStoreWithHashRouter, ROUTER_APP_STORE } from "./MakeHashRouterStore";

interface AppState {
	inPlanner: boolean;
}

const defaultState: AppState = { inPlanner: true };
function serialize(state: AppState) {
	return state.inPlanner ? "p" : "e";
}
function deserialize(serialized: string): AppState {
	return {
		inPlanner: serialized[0] === "p",
	};
}

const appStore = makeStoreWithHashRouter(
	{
		serialize,
		deserialize,
		makeDefault() {
			return defaultState;
		},
	},
	ROUTER_APP_STORE,
	"_AppStore",
);

const { useSelector, update } = appStore;
function changeInPlanner(newValue: boolean) {
	update((draft) => {
		draft.inPlanner = newValue;
	});
}

function App() {
	const inPlanner = useSelector((s) => s.inPlanner);
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
