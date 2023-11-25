import { TPC, VNode } from "vdomk";
import { connectSolution } from "../editor/store/ConnectSolution";
import { update as updateEditor } from "../editor/store/Store";
import { generateNetResults } from "../solver/GenerateNetResults";
import { solve, solveCoop } from "../solver/Solver";
import { makeProblem, State, useSelector } from "./store/Store";
import { Recipe } from "../../data/types";
import { FakePower } from "../../data/power";
import { makeAbortablePromise, useAbortableAsynchronousMemo } from "../hook/usePromise";
import { Spinner } from "../component/Spinner";

import "./Results.css";

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

	function renderRecipes() {
		const nodes: Array<VNode> = [];
		let index = 0;
		for (const recipe of problem.availableRecipes) {
			let rate = solution!.recipes[index++];
			if (rate.sign() > 0) {
				nodes.push(
					<tr>
						<th data-tooltip={rate.toRatioString() + "/min"}>{rate.toFixed(2)}x</th>
						<td>
							<img class="icon" src={imageForRecipe(recipe)} />
						</td>
						<td data-tooltip={recipe.ClassName}>{recipe.DisplayName}</td>
					</tr>,
				);
			}
		}
		return (
			<div class="pane">
				<h3 class="title">Recipes used</h3>
				<table>{nodes}</table>
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

	return (
		<>
			<div class="pane">
				<h2 class="title">Solution</h2>
				<h3 class="title">Overview</h3>
				<div>
					WP: <strong data-tooltip={solution.wp.toRatioString()}>{solution.wp.toFixed(2)}</strong>
				</div>
				{renderPower()}
				<div>
					<button
						onClick={() => {
							updateEditor((draft) => {
								Object.assign(draft, connectSolution(problem, solution));
							});
						}}
					>
						TEMP - Copy to Editor
					</button>
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
