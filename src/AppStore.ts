import { ROUTER_APP_STORE, makeStoreWithHashRouter } from "./MakeHashRouterStore";

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

export const { useSelector, update } = appStore;
export function changeInPlanner(newValue: boolean) {
	update((draft) => {
		draft.inPlanner = newValue;
	});
}
