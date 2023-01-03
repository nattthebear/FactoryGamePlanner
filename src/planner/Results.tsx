import { connectSolution } from "../editor/store/ConnectSolution";
import { update as updateEditor } from "../editor/store/Store";
import { generateNetResults } from "../solver/GenerateNetResults";
import { solve } from "../solver/Solver";
import { makeProblem, useSelector } from "./store/Store";
import { Recipe } from "../../data/types";
import { FakePower } from "../../data/power";

import "./Results.css";

function imageForRecipe(recipe: Recipe) {
	if (recipe.Building.PowerConsumption.sign() < 0) {
		return FakePower.Icon;
	}
	return recipe.Outputs[0].Item.Icon;
}

export function Results() {
	const state = useSelector((s) => s);

	const problem = makeProblem(state);
	const solution = solve(problem);

	if (!solution) {
		return <div>No solution found. Check your inputs and recipes.</div>;
	}

	const net = generateNetResults(problem, solution);

	function renderRecipes() {
		const nodes = Array<preact.ComponentChild>(problem.availableRecipes.size);
		let index = 0;
		for (const recipe of problem.availableRecipes) {
			let rate = solution!.recipes[index++];
			if (rate.sign() > 0) {
				nodes.push(
					<tr>
						<th data-tooltip={rate.toRatioString()}>{rate.toFixed(2)}x</th>
						<td>
							<img class="icon" src={imageForRecipe(recipe)} />
						</td>
						<td>{recipe.DisplayName}</td>
					</tr>
				);
			}
		}
		return (
			<div class="pane">
				<div class="title">Recipes used</div>
				<table>{nodes}</table>
			</div>
		);
	}

	function renderNet() {
		const consumed = Array<preact.ComponentChild>();
		const produced = Array<preact.ComponentChild>();
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
					<th data-tooltip={rate.toRatioString()}>{rate.toFixed(2)}/min</th>
					<td>
						<img class="icon" src={item.Icon} />
					</td>
					<td>{item.DisplayName}</td>
				</tr>
			);
		}
		return (
			<>
				<div class="pane">
					<div class="title">Items produced</div>
					<table>{produced}</table>
				</div>
				<div class="pane">
					<div class="title">Items used</div>
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
				Power: <strong data-tooltip={rate.toRatioString()}>{rate.toFixed(2)} MW</strong> {text}
			</div>
		);
	}

	return (
		<div class="results">
			<div class="inner">
				<div class="scroll">
					<div class="pane">
						<div class="title">Overview</div>
						<div>
							WP: <strong data-tooltip={solution.wp.toRatioString()}>{solution.wp.toFixed(2)}</strong>
						</div>
						{renderPower()}
					</div>

					<br />
					<button
						onClick={() => {
							updateEditor((draft) => {
								Object.assign(draft, connectSolution(problem, solution));
							});
						}}
					>
						TEMP - Copy to Editor
					</button>
					<br />
					{renderNet()}
					{renderRecipes()}
				</div>
			</div>
		</div>
	);
}
