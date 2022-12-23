import { Draft } from "../immer";
import { Items } from "../../data/generated/items";
import { chooseItem } from "../component/ItemChooser";
import { chooseSourceSinkRate } from "../component/RateChoser";
import { Sink, Source } from "../editor/store/Producers";
import { BigRat } from "../math/BigRat";
import { Flow } from "../util";
import { defaultResourceData, getStateRaw, Resources, update, useSelector } from "./store/Store";

const makeRateList = (
	useData: () => Flow[],
	updateData: (cb: (draft: Draft<Flow[]>) => void) => void,
	promptRate: (flow: Flow) => Promise<BigRat | null>
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
							&#9650;
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
							&#9660;
						</button>
						<button
							onClick={async () => {
								const { products, inputs } = getStateRaw();
								const possibleItems = Items.filter(
									(i) =>
										i === d.item ||
										(!i.IsResource &&
											!products.find((r) => r.item === i) &&
											!inputs.find((r) => r.item === i))
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
								const newRate = await promptRate(d);
								if (newRate) {
									updateData((draft) => {
										draft[index].rate = newRate;
									});
								}
							}}
						>
							{d.rate.toNumberApprox().toFixed(2).toString()}/min
						</button>
						<button
							onClick={() =>
								updateData((draft) => {
									draft.splice(index, 1);
								})
							}
						>
							&#x2716;
						</button>
					</div>
				))}
				<div
					class="rate-add"
					onClick={async () => {
						const { products, inputs } = getStateRaw();
						const possibleItems = Items.filter(
							(i) =>
								!i.IsResource &&
								!products.find((r) => r.item === i) &&
								!inputs.find((r) => r.item === i)
						);
						const newItem = await chooseItem("Select new item:", possibleItems);
						if (newItem) {
							updateData((draft) => {
								draft.push({
									rate: new BigRat(60n, 1n),
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

const chooseInputRate = async (flow: Flow) => {
	// HACK:  Shouldn't be referencing sinks/sources here
	const fakeSink = new Sink(0, 0, flow.rate, flow.item);
	return chooseSourceSinkRate(fakeSink);
};
const chooseOutputRate = async (flow: Flow) => {
	// HACK:  Shouldn't be referencing sinks/sources here
	const fakeSource = new Source(0, 0, flow.rate, flow.item);
	return chooseSourceSinkRate(fakeSource);
};

const ProductsRateList = makeRateList(
	() => useSelector((state) => state.products),
	(cb) => update((draft) => cb(draft.products)),
	chooseOutputRate
);

const InputsRateList = makeRateList(
	() => useSelector((state) => state.inputs),
	(cb) => update((draft) => cb(draft.inputs)),
	chooseInputRate
);

export function ConstraintEditor() {
	const resources = useSelector((state) => state.resources);

	return (
		<div class="rate-setter">
			<div class="pane">
				<div class="title">Outputs</div>
				<ProductsRateList />
			</div>
			<div class="pane">
				<div class="title">Extra Inputs</div>
				<InputsRateList />
			</div>
			<div class="pane">
				<div class="title">Resources</div>
				{resources.map((value, index) => {
					const item = Resources[index];
					const defaultValue = defaultResourceData.get(item) ?? null;
					const isDefault = (!value && !defaultValue) || (value && defaultValue && value.eq(defaultValue));
					return (
						<div class="resource-item">
							{item.DisplayName}
							<button
								onClick={async () => {
									const newValue = await chooseInputRate({
										rate: value ?? new BigRat(100n, 1n),
										item,
									});
									if (newValue) {
										update((draft) => {
											draft.resources[index] = newValue;
										});
									}
								}}
							>
								{value ? `${value.toNumberApprox().toFixed(2)}/min` : "Unlimited"}
							</button>
							<button
								disabled={!!isDefault}
								onClick={() =>
									update((draft) => {
										draft.resources[index] = defaultValue;
									})
								}
							>
								Set Default
							</button>
							<button
								disabled={!value}
								onClick={() =>
									update((draft) => {
										draft.resources[index] = null;
									})
								}
							>
								Set Unlimited
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
