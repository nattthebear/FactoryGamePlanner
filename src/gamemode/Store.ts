import { DefaultGameMode, GameMode, GAMEMODE_BITS, parseGameMode, serializeGameMode } from "../../data/gameModes";
import { RStream, WStream } from "../base64";
import { makeStoreWithHashRouter, ROUTER_GAMEMODE_STORE } from "../MakeHashRouterStore";

export interface State {
	gameMode: GameMode;
}

const defaultState: State = {
	gameMode: DefaultGameMode,
};

const VERSION = 0;

function serialize(state: State) {
	const w = new WStream();
	w.write(6, VERSION);
	w.write(GAMEMODE_BITS, serializeGameMode(state.gameMode));
	return w.finish();
}

function deserialize(encoded: string): State | null {
	const r = new RStream(encoded);
	const version = r.read(6);
	switch (version) {
		case 0:
			const gameMode = parseGameMode(r.read(GAMEMODE_BITS));
			if (gameMode != null) {
				return { gameMode };
			}
			break;
		default:
			console.warn(`Decode: unknown version ${version}`);
			break;
	}
	return null;
}

export const { useSelector, update, getStateRaw } = makeStoreWithHashRouter(
	{
		serialize,
		deserialize,
		makeDefault() {
			return defaultState;
		},
	},
	ROUTER_GAMEMODE_STORE,
	"_GameModeStore",
);

export function getCurrentGameModeRaw() {
	return getStateRaw().gameMode;
}
