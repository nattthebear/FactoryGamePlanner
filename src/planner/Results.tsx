import { TPC, VNode } from "vdomk";
import { connectSolution } from "../editor/store/ConnectSolution";
import { update as updateEditor } from "../editor/store/Store";
import { generateNetResults } from "../solver/GenerateNetResults";
import { solve, solveCoop } from "../solver/Solver";
import { makeProblem, State, update, useSelector } from "./store/Store";
import { Building, Recipe } from "../../data/types";
import { FakePower } from "../../data/power";
import { makeAbortablePromise, useAbortableAsynchronousMemo } from "../hook/usePromise";
import { Spinner } from "../component/Spinner";
import { promptBoolean } from "../component/PromptBoolean";
import { changeInPlanner } from "../AppStore";

import "./Results.css";
import { BigRat } from "../math/BigRat";
import { Buildings } from "../../data/generated/buildings";
import { Recipes } from "../../data/generated/recipes";

const MAX_OC = BigRat.fromIntegers(5, 2);

// 2 meters are added on each side with an input or output, to give a bare minimum
// amount of space to run conveyors and pipes
const FOOTPRINT_BY_BUILDING = [
	8 * (10 + 4), // Build_ConstructorMk1_C
	5 * (9 + 4), // Build_SmelterMk1_C
	10 * (9 + 4), // Build_FoundryMk1_C
	10 * (20 + 4), // Build_OilRefinery_C
	10 * (15 + 4), // Build_AssemblerMk1_C
	8 * (8 + 4), // Build_Packager_C
	18 * (16 + 4), // Build_Blender_C
	18 * (20 + 4), // Build_ManufacturerMk1_C
	24 * (38 + 4), // Build_HadronCollider_C
	10 * (26 + 2), // Build_GeneratorCoal_C
	20 * (20 + 2), // Build_GeneratorFuel_C
	36 * (43 + 2), // Build_GeneratorNuclear_C
	20 * (20 + 4), // Build_QuantumEncoder_C // ???
	20 * (20 + 4), // Build_Converter_C // ???
	8 * (8 + 2), // Build_GeneratorBiomass_Automated_C
];

function imageForRecipe(recipe: Recipe) {
	if (recipe.Building.PowerConsumption.sign() < 0) {
		return FakePower.Icon;
	}
	return recipe.Outputs[0].Item.Icon;
}

function* solveAndRender(state: State) {
	const problem = makeProblem(state);
	yield;
	const solution = yield* solveCoop(problem);
	if (!solution) {
		return (
			<div class="pane">
				<h2 class="title">Solution</h2>
				<div>No solution found. Check your inputs and recipes.</div>
			</div>
		);
	}
	yield;
	const net = generateNetResults(problem, solution);
	yield;

	const buildingCounts = new Map<Building, number>();
	const buildingCountsOC = new Map<Building, number>();
	let recipeNodes: VNode[] = [];
	const usedRecipes = new Set<Recipe>();

	{
		let index = 0;
		for (const recipe of problem.availableRecipes) {
			let rate = solution!.recipes[index++];
			if (rate.sign() > 0) {
				usedRecipes.add(recipe);
				recipeNodes.push(
					<tr>
						<th data-tooltip={rate.toRatioString()}>{rate.toFixed(2)}x</th>
						<td>
							<img class="icon" src={imageForRecipe(recipe)} />
						</td>
						<td data-tooltip={recipe.ClassName}>{recipe.DisplayName}</td>
						<td>
							<button
								onClick={() =>
									update((draft) => {
										draft.recipes.delete(recipe);
									})
								}
							>
								Disable
							</button>
						</td>
					</tr>,
				);
				const { Building } = recipe;
				buildingCounts.set(Building, (buildingCounts.get(Building) ?? 0) + Number(rate.ceil()));
				buildingCountsOC.set(Building, (buildingCountsOC.get(Building) ?? 0) + Number(rate.div(MAX_OC).ceil()));
			}
		}
	}

	function renderRecipes() {
		return (
			<div class="pane">
				<h3 class="title">
					Recipes used{" "}
					<span data-tooltip={"Disable any recipe not\nused in this solution"}>
						<button
							onClick={() =>
								update((draft) => {
									for (const recipe of Recipes) {
										if (!usedRecipes.has(recipe)) {
											draft.recipes.delete(recipe);
										}
									}
								})
							}
						>
							Disable others
						</button>
					</span>
				</h3>
				<table>{recipeNodes}</table>
			</div>
		);
	}

	function renderNet() {
		const consumed = Array<VNode>();
		const produced = Array<VNode>();
		for (let [item, rate] of net.items) {
			const sign = rate.sign();
			if (sign === 0) {
				continue;
			}
			const dest = sign > 0 ? produced : consumed;
			if (sign < 0) {
				rate = rate.neg();
			}

			dest.push(
				<tr>
					<th data-tooltip={rate.toRatioString() + "/min"}>{rate.toFixed(2)}/min</th>
					<td>
						<img class="icon" src={item.Icon} />
					</td>
					<td>{item.DisplayName}</td>
				</tr>,
			);
		}
		return (
			<>
				<div class="pane">
					<h3 class="title">Items produced</h3>
					<table>{produced}</table>
				</div>
				<div class="pane">
					<h3 class="title">Items used</h3>
					<table>{consumed}</table>
				</div>
			</>
		);
	}

	function renderPower() {
		const sign = net.power.sign();
		const text = sign < 0 ? "consumed" : "produced";
		const rate = sign < 0 ? net.power.neg() : net.power;
		return (
			<div>
				Power: <strong data-tooltip={rate.toRatioString() + " MW"}>{rate.toFixed(2)} MW</strong> {text}
			</div>
		);
	}

	function renderBuildingCounts() {
		const breakdown = (map: Map<Building, number>) => {
			let tooltip = "";
			let total = 0;
			for (const building of Buildings) {
				const value = map.get(building);
				if (value) {
					if (tooltip) {
						tooltip += "\n";
					}
					tooltip += `${building.DisplayName}: ${value}`;
					total += value;
				}
			}
			return <strong data-tooltip={tooltip}>{total}</strong>;
		};

		return (
			<div>
				Building count: {breakdown(buildingCounts)}, overclocked: {breakdown(buildingCountsOC)}
			</div>
		);
	}

	function renderFootprint() {
		const breakdown = (map: Map<Building, number>) => {
			let tooltip = "";
			let total = 0;
			let index = 0;
			for (const building of Buildings) {
				const value = map.get(building);
				if (value) {
					const footprint = value * FOOTPRINT_BY_BUILDING[index];
					if (tooltip) {
						tooltip += "\n";
					}
					tooltip += `${building.DisplayName}: ${footprint} m²`;
					total += footprint;
				}
				index += 1;
			}
			return <strong data-tooltip={tooltip}>{total} m²</strong>;
		};

		return (
			<div>
				Footprint: {breakdown(buildingCounts)}, overclocked: {breakdown(buildingCountsOC)}
			</div>
		);
	}

	return (
		<>
			<div class="pane">
				<h2 class="title">Solution</h2>
				<h3 class="title">Overview</h3>
				<div class="result-summary-area">
					<div>
						<div>
							WP: <strong data-tooltip={solution.wp.toRatioString()}>{solution.wp.toFixed(2)}</strong>
						</div>
						{renderPower()}
						{renderBuildingCounts()}
						{renderFootprint()}
					</div>
					<div>
						<button
							onClick={async () => {
								if (
									await promptBoolean({
										title: "Confirm Copy to Editor",
										message: "This will clear any existing contents of the editor.",
									})
								) {
									updateEditor((draft) => {
										Object.assign(draft, connectSolution(problem, solution));
									});
									changeInPlanner(false);
								}
							}}
						>
							Copy Solution to Editor
						</button>
					</div>
				</div>
			</div>

			<div class="scrollable">
				{renderNet()}
				{renderRecipes()}
			</div>
		</>
	);
}

const solvePromisify = (state: State) => makeAbortablePromise(solveAndRender(state), 100);

export const Results: TPC<{}> = (_, instance) => {
	const getState = useSelector(instance, (s) => s);

	const solveAndRender = useAbortableAsynchronousMemo(instance, solvePromisify);

	return () => {
		const { value: content, stale } = solveAndRender([getState()]);

		return (
			<div class="results">
				<div class="inner">
					{stale && (
						<div class="loader">
							<Spinner />
						</div>
					)}
					<div class="contents">{content}</div>
				</div>
			</div>
		);
	};
};
