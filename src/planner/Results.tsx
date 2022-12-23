import { connectSolution } from "../editor/store/ConnectSolution";
import { update as updateEditor } from "../editor/store/Store";
import { doBothSolves, stringifyProblem } from "../solver/Solution";
import { solve } from "../solver/Solver";
import { makeProblem, useSelector } from "./store/Store";

export function Results() {
	const state = useSelector((s) => s);

	const problem = makeProblem(state);
	const solution = solve(problem);

	if (!solution) {
		return <div>No solution found. Check your inputs and recipes.</div>;
	}
	doBothSolves(problem);
	console.log([stringifyProblem(problem)]);

	const nodes = Array<preact.ComponentChild>(problem.availableRecipes.size);
	let index = 0;
	for (const recipe of problem.availableRecipes) {
		let rate = solution.recipes[index++];
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
		<div>
			WP: {solution.wp.toRatioString()}
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
			Recipes used:
			{nodes}
		</div>
	);
}
