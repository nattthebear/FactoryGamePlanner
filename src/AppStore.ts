import { ROUTER_APP_STORE, makeStoreWithHashRouter } from "./MakeHashRouterStore";

export type AppTab = "planner" | "editor" | "gamemode";

interface AppState {
	inTab: AppTab;
}

const defaultState: AppState = { inTab: "planner" };
function serialize(state: AppState) {
	return state.inTab[0];
}
function deserialize(serialized: string): AppState {
	const c = serialized[0];
	return {
		inTab: c === "p" ? "planner" : c === "e" ? "editor" : c === "g" ? "gamemode" : "planner",
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

export const { useSelector, update } = appStore;
export function changeAppTab(newValue: AppTab) {
	update((draft) => {
		draft.inTab = newValue;
	});
}
