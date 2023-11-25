import { LayerInstance, TPC } from "vdomk";
import { Draft } from "../immer";
import { chooseItem } from "../component/ItemChooser";
import { chooseConstraintRate } from "../component/RateChoser";
import { BigRat } from "../math/BigRat";
import {
	buildDefaultInputs,
	getStateRaw,
	NullableFlow,
	sortNullableFlowsMutate,
	update,
	useSelector,
} from "./store/Store";
import { Item } from "../../data/types";
import { FakePower, ItemsWithFakePower } from "../../data/power";

import "./ConstraintEditor.css";

const makeRateList = (
	useData: (instance: LayerInstance) => () => NullableFlow[],
	updateData: (cb: (draft: Draft<NullableFlow[]>) => void) => void,
	promptRate: (rate: BigRat | "unlimited", item: Item) => Promise<BigRat | "unlimited" | null>,
	unlimitedText: string,
	resetText: string,
	resetAction: () => void,
): TPC<{}> =>
	function RateList(_, instance) {
		const getData = useData(instance);

		return () => {
			const data = getData();

			return (
				<div class="rate-list">
					<table>
						{data.map((d, index) => (
							<tr>
								<td>
									<img class="icon" src={d.item.Icon} />
								</td>
								<td>
									<a
										onClick={async () => {
											const { products, inputs } = getStateRaw();
											const possibleItems = ItemsWithFakePower.filter(
												(i) =>
													i === d.item ||
													(!products.find((r) => r.item === i) &&
														!inputs.find((r) => r.item === i)),
											);
											const newItem = await chooseItem("Select new item:", possibleItems);
											if (newItem) {
												updateData((draft) => {
													draft[index].item = newItem;
												});
											}
										}}
									>
										{d.item.DisplayName}
									</a>
								</td>
								<th>
									<a
										onClick={async () => {
											const newRate = await promptRate(d.rate ?? "unlimited", d.item);
											if (newRate) {
												updateData((draft) => {
													draft[index].rate = newRate === "unlimited" ? null : newRate;
												});
											}
										}}
									>
										{d.rate
											? d.rate.toFixed(2).toString() + (d.item === FakePower ? " MW" : "/min")
											: unlimitedText}
									</a>
								</th>
								<td>
									<button
										onClick={() =>
											updateData((draft) => {
												draft.splice(index, 1);
											})
										}
									>
										✖&#xfe0e;
									</button>
								</td>
							</tr>
						))}
						<tr>
							<td>
								<div class="icon" />
							</td>
							<td colSpan={3}>
								<a
									onClick={async () => {
										const { products, inputs } = getStateRaw();
										const possibleItems = ItemsWithFakePower.filter(
											(i) =>
												!products.find((r) => r.item === i) &&
												!inputs.find((r) => r.item === i),
										);
										const newItem = await chooseItem("Select new item:", possibleItems);
										if (newItem) {
											updateData((draft) => {
												draft.push({
													rate: BigRat.fromIntegers(60, 1),
													item: newItem,
												});
											});
										}
									}}
								>
									Add new item...
								</a>
							</td>
						</tr>
						<tr>
							<td>
								<div class="icon" />
							</td>
							<td colSpan={3}>
								<a onClick={resetAction}>{resetText}</a>
							</td>
						</tr>
					</table>
				</div>
			);
		};
	};

const ProductsRateList = makeRateList(
	(instance) => useSelector(instance, (state) => state.products),
	(cb) =>
		update((draft) => {
			cb(draft.products);
			sortNullableFlowsMutate(draft.products);
		}),
	(rate, item) => chooseConstraintRate(rate, item, true),
	"maximize",
	"Clear outputs",
	() =>
		update((draft) => {
			draft.products = [];
		}),
);

const InputsRateList = makeRateList(
	(instance) => useSelector(instance, (state) => state.inputs),
	(cb) =>
		update((draft) => {
			cb(draft.inputs);
			sortNullableFlowsMutate(draft.inputs);
		}),
	(rate, item) => chooseConstraintRate(rate, item, false),
	"unlimited",
	"Set inputs to default",
	() =>
		update((draft) => {
			const inputs = buildDefaultInputs();
			draft.inputs = inputs;
			draft.products = draft.products.filter((p) => !inputs.find((i) => i.item.ClassName === p.item.ClassName));
		}),
);

export function ConstraintEditor() {
	return (
		<div class="rate-setter">
			<div class="pane">
				<h2 class="title">Settings</h2>
			</div>
			<div class="scrollable">
				<div class="pane">
					<h3 class="title">Outputs</h3>
					<ProductsRateList />
				</div>
				<div class="pane">
					<h3 class="title">Inputs</h3>
					<InputsRateList />
				</div>
			</div>
		</div>
	);
}
