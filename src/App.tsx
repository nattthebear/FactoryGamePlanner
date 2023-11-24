import { createRoot, TPC } from "vdomk";
import { Editor } from "./editor";
import { PromptRoot } from "./component/Prompt";
import { AppActions } from "./AppActions";
import { Planner } from "./planner";
import { installTooltip } from "./component/Tooltip";
import { makeStoreWithHashRouter, ROUTER_APP_STORE } from "./MakeHashRouterStore";

import "./App.css";

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
createRoot(document.getElementById("root")!, <App />);
