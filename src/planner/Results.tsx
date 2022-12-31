import { connectSolution } from "../editor/store/ConnectSolution";
import { update as updateEditor } from "../editor/store/Store";
import { generateNetResults } from "../solver/GenerateNetResults";
import { solveV2 } from "../solver/SolverV2";
import { makeProblem, useSelector } from "./store/Store";

export function Results() {
	const state = useSelector((s) => s);

	const problem = makeProblem(state);
	const solution = solveV2(problem);

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
					<div>
						<strong>{rate.toNumberApprox().toFixed(2)}x</strong> {recipe.DisplayName}{" "}
						<em>{rate.toRatioString()}</em>
					</div>
				);
			}
		}
		return (
			<div class="pane">
				<div class="title">Recipes used</div>
				{nodes}
			</div>
		);
	}

	function renderNet() {
		console.log(net);
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
				<div>
					<strong>{rate.toNumberApprox().toFixed(2)}/min</strong> {item.DisplayName}{" "}
					<em>{rate.toRatioString()}</em>
				</div>
			);
		}
		return (
			<>
				<div class="pane">
					<div class="title">Items produced</div>
					{produced}
				</div>
				<div class="pane">
					<div class="title">Items used</div>
					{consumed}
				</div>
			</>
		);
	}

	function renderPower() {
		const sign = net.power.sign();
		const text = sign < 0 ? "consumed" : "produced";
		const rate = sign < 0 ? net.power.neg() : net.power;
		return <div>Power: {rate.toNumberApprox().toFixed(2)} MW</div>;
	}

	return (
		<div>
			<div class="pane">
				<div class="title">Overview</div>
				<div>WP: {solution.wp.toRatioString()}</div>
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
	);
}
