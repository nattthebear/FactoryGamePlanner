import { TPC, scheduleUpdate } from "vdomk";
import { produce } from "../immer";
import { BigRat } from "../math/BigRat";
import { ProductionBuilding, Sink, Source } from "../editor/store/Producers";
import { prompt } from "./Prompt";
import { Flow } from "../util";
import { Item } from "../../data/types";
import { FakePower } from "../../data/power";
import { evaluateToInputValue, ExpressionInput, ExpressionInputValue, unevaluateToInputValue } from "./ExpressionInput";

import "./RateChooser.css";

function forcePositive(inputValue: ExpressionInputValue): ExpressionInputValue {
	if (inputValue.value?.lte(BigRat.ZERO)) {
		return {
			text: inputValue.text,
			value: null,
			error: true,
			message: `${inputValue.value.toFixed(1)} is not positive.`,
			offset: null,
		};
	}
	return inputValue;
}

const BuildingRateChooser: TPC<{
	producer: ProductionBuilding;
	onConfirm: (newValue: BigRat | null) => void;
}> = ({ producer, onConfirm }, instance) => {
	let { rate } = producer;
	let inputValue = unevaluateToInputValue(rate);
	function changeValue(newValue: ExpressionInputValue) {
		inputValue = forcePositive(newValue);
		if (!inputValue.error) {
			rate = inputValue.value;
		}
		scheduleUpdate(instance);
	}

	return (nextProps) => {
		({ producer, onConfirm } = nextProps);

		const newProducer = produce(producer, (draft) => {
			draft.rate = rate;
		});

		const renderFlow = (flow: Flow) => (
			<div class="flow">
				<img src={flow.item.Icon} />
				<span>{flow.rate.toFixed(2)}/min</span>
			</div>
		);

		return (
			<div class="building-rate-chooser">
				<ExpressionInput inputValue={inputValue} onChange={changeValue} onSubmit={() => onConfirm(rate)} />
				<div class="display">
					<div class="flows">{newProducer.inputFlows().map(renderFlow)}</div>
					<div class="rate">
						<span class="num">{rate.toFixed(2)}x</span>
						<span class="ratio">{rate.toRatioString()}</span>
					</div>
					<div class="flows">{newProducer.outputFlows().map(renderFlow)}</div>
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(rate)}>Ok</button>
				</div>
			</div>
		);
	};
};

const SourceSinkRateChooser: TPC<{
	producer: Sink | Source;
	onConfirm: (newValue: BigRat | null) => void;
}> = ({ producer, onConfirm }, instance) => {
	let { rate } = producer;
	let inputValue = unevaluateToInputValue(rate);
	function changeValue(newValue: ExpressionInputValue) {
		inputValue = forcePositive(newValue);
		if (!inputValue.error) {
			rate = inputValue.value;
		}
		scheduleUpdate(instance);
	}

	return (nextProps) => {
		({ producer, onConfirm } = nextProps);

		const newProducer = produce(producer, (draft) => {
			draft.rate = rate;
		});

		const renderFlows = (flows: Flow[]) => flows.length > 0 && <img src={flows[0].item.Icon} />;

		return (
			<div class="source-sink-rate-chooser">
				<ExpressionInput inputValue={inputValue} onChange={changeValue} onSubmit={() => onConfirm(rate)} />
				<div class="display">
					{renderFlows(newProducer.inputFlows())}
					<div class="rate">
						<div class="num">{rate.toFixed(2)}/min</div>
						<div class="ratio">{rate.toRatioString()}</div>
					</div>
					{renderFlows(newProducer.outputFlows())}
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(rate)}>Ok</button>
				</div>
			</div>
		);
	};
};

export const chooseBuildingRate = (producer: ProductionBuilding) =>
	prompt<BigRat | null>({
		title: "Choose new rate.",
		render: (onConfirm) => <BuildingRateChooser producer={producer} onConfirm={onConfirm} />,
	});

export const chooseSourceSinkRate = (producer: Source | Sink) =>
	prompt<BigRat | null>({
		title: "Choose new rate.",
		render: (onConfirm) => <SourceSinkRateChooser producer={producer} onConfirm={onConfirm} />,
	});

const ConstraintRateChooser: TPC<{
	initialRate: BigRat | "unlimited";
	item: Item;
	onConfirm: (newValue: BigRat | "unlimited" | null) => void;
	isOutput: boolean;
}> = ({ initialRate, item, onConfirm, isOutput }, instance) => {
	let rate = initialRate;
	let inputValue = rate === "unlimited" ? evaluateToInputValue("") : unevaluateToInputValue(rate);
	function changeValue(newValue: ExpressionInputValue) {
		inputValue = forcePositive(newValue);
		if (!inputValue.error) {
			rate = inputValue.value;
		}
		scheduleUpdate(instance);
	}

	function renderValue() {
		if (rate === "unlimited") {
			return isOutput ? "Maximize" : "Unlimited";
		}
		const suffix = item === FakePower ? " MW" : "/min";
		return rate.toFixed(2) + suffix;
	}

	return (nextProps) => {
		({ item, onConfirm, isOutput } = nextProps);

		return (
			<div class="source-sink-rate-chooser">
				<ExpressionInput inputValue={inputValue} onChange={changeValue} onSubmit={() => onConfirm(rate)} />
				<div class="display">
					{!isOutput && <img src={item.Icon} />}
					<div class="rate">
						<div class="num">{renderValue()}</div>
						<div class="ratio">{rate === "unlimited" ? "" : rate.toRatioString()}</div>
					</div>
					{isOutput && <img src={item.Icon} />}
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm("unlimited")}>{isOutput ? "Maximize" : "Unlimited"}</button>
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(rate)}>Ok</button>
				</div>
			</div>
		);
	};
};

export const chooseConstraintRate = (existingRate: BigRat | "unlimited", item: Item, isOutput: boolean) =>
	prompt<BigRat | "unlimited" | null>({
		title: "Choose new rate.",
		render: (onConfirm) => (
			<ConstraintRateChooser initialRate={existingRate} item={item} onConfirm={onConfirm} isOutput={isOutput} />
		),
	});
