import { TPC } from "vdomk";

import "./Settings.css";
import {
	getPCMIndex,
	getRPCMIndex,
	PowerCostMultipliers,
	RecipePartsCostMultipliers,
	setPCMIndex,
	setRPCMIndex,
} from "../../data/gameModes";
import { BigRat } from "../math/BigRat";
import { update, useGetGameMode } from "./Store";

function makeOptions(values: BigRat[]) {
	return values.map((value, index) => {
		return <option value={index}>{value.toFixed(2)}x</option>;
	});
}

const rpcmOptions = makeOptions(RecipePartsCostMultipliers);
const pcmOptions = makeOptions(PowerCostMultipliers);

export const Settings: TPC<{}> = (_, instance) => {
	const getGameMode = useGetGameMode(instance);

	return () => {
		const gameMode = getGameMode();

		return (
			<div class="settings">
				<div class="content">
					<h2 class="title">Settings</h2>
					<div>These settings apply to both the planner and the editor.</div>
					<h3 class="title">Recipe Cost Multipler</h3>
					<select
						value={getRPCMIndex(gameMode)}
						onChange={(event) => {
							const newIndex = Number(event.currentTarget.value);
							update((draft) => {
								draft.gameMode = setRPCMIndex(draft.gameMode, newIndex);
							});
						}}
					>
						{rpcmOptions}
					</select>
					<h3 class="title">Power Consumption Multiplier</h3>
					<select
						value={getPCMIndex(gameMode)}
						onChange={(event) => {
							const newIndex = Number(event.currentTarget.value);
							update((draft) => {
								draft.gameMode = setPCMIndex(draft.gameMode, newIndex);
							});
						}}
					>
						{pcmOptions}
					</select>
				</div>
			</div>
		);
	};
};
