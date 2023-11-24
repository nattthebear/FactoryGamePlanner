import { TPC, VNode, scheduleUpdate } from "vdomk";
import { ConstraintEditor } from "./ConstraintEditor";
import { RecipeFilterAlternate, RecipeFilterBasic } from "./RecipeFilter";
import { Results } from "./Results";

import "./FactoryPlanner.css";

type TabType = "constraints" | "basicRecipes" | "alternateRecipes";

const tabs: { type: TabType; name: string; content: VNode }[] = [
	{
		type: "constraints",
		name: "Resource Limits",
		content: <ConstraintEditor />,
	},
	{
		type: "basicRecipes",
		name: "Basic Recipes",
		content: <RecipeFilterBasic />,
	},
	{
		type: "alternateRecipes",
		name: "Alternate Recipes",
		content: <RecipeFilterAlternate />,
	},
];

const resultsArea = (
	<div class="results-area">
		<Results />
	</div>
);

export const FactoryPlanner: TPC<{}> = (_, instance) => {
	let activeTab: TabType = "constraints";

	return () => (
		<div class="factory-planner">
			<div class="tabs-holder">
				<div class="tabs">
					{tabs.map(({ type, name }) => (
						<button
							class="tab"
							role="tab"
							aria-selected={type === activeTab}
							onClick={() => {
								activeTab = type;
								scheduleUpdate(instance);
							}}
						>
							{name}
						</button>
					))}
				</div>
				<div class="tab-content" role="tabpanel">
					{tabs.find((tab) => tab.type === activeTab)!.content}
				</div>
			</div>
			{resultsArea}
		</div>
	);
};
