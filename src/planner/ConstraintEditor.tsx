import { Draft } from "../immer";
import { Items } from "../../data/generated/items";
import { chooseItem } from "../component/ItemChooser";
import { chooseConstraintRate } from "../component/RateChoser";
import { BigRat } from "../math/BigRat";
import { buildDefaultInputs, getStateRaw, NullableFlow, Resources, update, useSelector } from "./store/Store";

import "./ConstraintEditor.css";
import { Item } from "../../data/types";
import { FakePower, ItemsWithFakePower } from "../../data/power";

const makeRateList = (
	useData: () => NullableFlow[],
	updateData: (cb: (draft: Draft<NullableFlow[]>) => void) => void,
	promptRate: (rate: BigRat | "unlimited", item: Item) => Promise<BigRat | "unlimited" | null>,
	unlimitedText: string,
) =>
	function RateList() {
		const data = useData();

		return (
			<div class="rate-list">
				{data.map((d, index) => (
					<div class="rate-item">
						<button
							disabled={index === 0}
							onClick={() =>
								updateData((draft) => {
									const prev = draft[index - 1];
									const curr = draft[index];
									draft[index - 1] = curr;
									draft[index] = prev;
								})
							}
						>
							▲
						</button>
						<button
							disabled={index === data.length - 1}
							onClick={() =>
								updateData((draft) => {
									const next = draft[index + 1];
									const curr = draft[index];
									draft[index + 1] = curr;
									draft[index] = next;
								})
							}
						>
							▼
						</button>
						<button
							onClick={async () => {
								const { products, inputs } = getStateRaw();
								const possibleItems = ItemsWithFakePower.filter(
									(i) =>
										i === d.item ||
										(!products.find((r) => r.item === i) && !inputs.find((r) => r.item === i)),
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
						</button>
						<button
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
						</button>
						<button
							onClick={() =>
								updateData((draft) => {
									draft.splice(index, 1);
								})
							}
						>
							✖
						</button>
					</div>
				))}
				<div
					class="rate-add"
					onClick={async () => {
						const { products, inputs } = getStateRaw();
						const possibleItems = ItemsWithFakePower.filter(
							(i) => !products.find((r) => r.item === i) && !inputs.find((r) => r.item === i),
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
					Add new item
				</div>
			</div>
		);
	};

const ProductsRateList = makeRateList(
	() => useSelector((state) => state.products),
	(cb) => update((draft) => cb(draft.products)),
	(rate, item) => chooseConstraintRate(rate, item, true),
	"maximize",
);

const InputsRateList = makeRateList(
	() => useSelector((state) => state.inputs),
	(cb) => update((draft) => cb(draft.inputs)),
	(rate, item) => chooseConstraintRate(rate, item, false),
	"unlimited",
);

export function ConstraintEditor() {
	return (
		<div class="rate-setter">
			<div class="pane">
				<h2 class="title">Settings</h2>
			</div>
			<div class="pane">
				<h3 class="title">Outputs</h3>
				<ProductsRateList />
				<button
					onClick={() =>
						update((draft) => {
							draft.products = [];
						})
					}
				>
					Clear outputs
				</button>
			</div>
			<div class="pane">
				<h3 class="title">Inputs</h3>
				<InputsRateList />
				<button
					onClick={() =>
						update((draft) => {
							const inputs = buildDefaultInputs();
							draft.inputs = inputs;
							draft.products = draft.products.filter(
								(p) => !inputs.find((i) => i.item.ClassName === p.item.ClassName),
							);
						})
					}
				>
					Set inputs to default
				</button>
			</div>
		</div>
	);
}
