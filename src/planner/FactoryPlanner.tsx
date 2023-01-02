import { useState } from "preact/hooks";
import { ConstraintEditor } from "./ConstraintEditor";
import { RecipeFilterAlternate, RecipeFilterBasic } from "./RecipeFilter";

import "./FactoryPlanner.css";
import { Results } from "./Results";

type TabType = "constraints" | "basicRecipes" | "alternateRecipes";

const tabs: { type: TabType; name: string; content: preact.ComponentChild }[] = [
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

export function FactoryPlanner() {
	const [activeTab, changeTab] = useState<TabType>("constraints");

	return (
		<div class="factory-planner">
			<div class="tabs-holder">
				<div class="tabs">
					{tabs.map(({ type, name }) => (
						<div
							class={type === activeTab ? "tab active" : "tab"}
							onClick={() => {
								changeTab(type);
							}}
						>
							{name}
						</div>
					))}
				</div>
				<div class="tab-content">{tabs.find((tab) => tab.type === activeTab)!.content}</div>
			</div>
			{resultsArea}
		</div>
	);
}
