import { TPC, effect, scheduleUpdate } from "vdomk";
import { produce } from "../immer";
import { BigRat } from "../math/BigRat";
import { evaluate } from "../math/Expression";
import { ProductionBuilding, Sink, Source } from "../editor/store/Producers";
import { prompt } from "./Prompt";

import "./RateChooser.css";
import { Flow } from "../util";
import { Item } from "../../data/types";
import { FakePower } from "../../data/power";

function evaluateAndVerify(text: string) {
	if (!text) {
		return {
			value: null,
			error: false,
			message: "Enter a number or expression.",
			offset: null,
		};
	}
	const res = evaluate(text);
	if (!res.ok) {
		return {
			value: null,
			error: true,
			message: res.message,
			offset: res.offset,
		};
	}
	if (res.value.lte(BigRat.ZERO)) {
		return {
			value: null,
			error: true,
			message: `${res.value.toFixed(1)} is negative.`,
			offset: null,
		};
	}
	return { value: res.value, error: false, message: null, offset: null };
}

const ExpressionInput: TPC<{ onChange: (value: BigRat) => void }> = (_, instance) => {
	let text = "";
	let evalRes = evaluateAndVerify("");

	const inputRef = (value: HTMLInputElement | null) => (inputElt = value);
	let inputElt: HTMLInputElement | null = null;
	effect(instance, () => inputElt!.focus());

	return ({ onChange }) => {
		const underlay = evalRes.offset != null && (
			<span class="underlay">
				{" ".repeat(evalRes.offset)}
				<span class="error"> </span>
			</span>
		);

		const lowertext = (
			<span class="lower-text">
				<span class={evalRes.error ? "error" : undefined}>{evalRes.message || "\u00a0"}</span>
			</span>
		);

		return (
			<div class="expression-input">
				{underlay}
				<input
					type="text"
					ref={inputRef}
					value={text}
					onInput={(ev) => {
						const newText = ev.currentTarget.value;
						const newEvalResult = evaluateAndVerify(newText);
						text = newText;
						evalRes = newEvalResult;
						scheduleUpdate(instance);
						if (newEvalResult.value) {
							onChange(newEvalResult.value);
						}
					}}
				/>
				{lowertext}
			</div>
		);
	};
};

const BuildingRateChooser: TPC<{
	producer: ProductionBuilding;
	onConfirm: (newValue: BigRat | null) => void;
}> = ({ producer, onConfirm }, instance) => {
	let value = producer.rate;
	function changeValue(newValue: BigRat) {
		value = newValue;
		scheduleUpdate(instance);
	}

	return (nextProps) => {
		({ producer, onConfirm } = nextProps);

		const newProducer = produce(producer, (draft) => {
			draft.rate = value;
		});

		const renderFlow = (flow: Flow) => (
			<div class="flow">
				<img src={flow.item.Icon} />
				<span>{flow.rate.toFixed(2)}/min</span>
			</div>
		);

		return (
			<div class="building-rate-chooser">
				<form
					onSubmit={(ev) => {
						ev.preventDefault();
						onConfirm(value);
					}}
				>
					<ExpressionInput onChange={changeValue} />
				</form>
				<div class="display">
					<div class="flows">{newProducer.inputFlows().map(renderFlow)}</div>
					<div class="rate">
						<span class="num">{value.toFixed(2)}x</span>
						<span class="ratio">{value.toRatioString()}</span>
					</div>
					<div class="flows">{newProducer.outputFlows().map(renderFlow)}</div>
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(value)}>Ok</button>
				</div>
			</div>
		);
	};
};

const SourceSinkRateChooser: TPC<{
	producer: Sink | Source;
	onConfirm: (newValue: BigRat | null) => void;
}> = ({ producer, onConfirm }, instance) => {
	let value = producer.rate;
	function changeValue(newValue: BigRat) {
		value = newValue;
		scheduleUpdate(instance);
	}

	return (nextProps) => {
		({ producer, onConfirm } = nextProps);

		const newProducer = produce(producer, (draft) => {
			draft.rate = value;
		});

		const renderFlows = (flows: Flow[]) => flows.length > 0 && <img src={flows[0].item.Icon} />;

		return (
			<div class="source-sink-rate-chooser">
				<form
					onSubmit={(ev) => {
						ev.preventDefault();
						onConfirm(value);
					}}
				>
					<ExpressionInput onChange={changeValue} />
				</form>
				<div class="display">
					{renderFlows(newProducer.inputFlows())}
					<div class="rate">
						<div class="num">{value.toFixed(2)}/min</div>
						<div class="ratio">{value.toRatioString()}</div>
					</div>
					{renderFlows(newProducer.outputFlows())}
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(value)}>Ok</button>
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
	rate: BigRat | "unlimited";
	item: Item;
	onConfirm: (newValue: BigRat | "unlimited" | null) => void;
	isOutput: boolean;
}> = ({ rate, item, onConfirm, isOutput }, instance) => {
	let value = rate;
	function changeValue(newValue: BigRat) {
		value = newValue;
		scheduleUpdate(instance);
	}

	function renderValue() {
		if (value === "unlimited") {
			return isOutput ? "Maximize" : "Unlimited";
		}
		const suffix = item === FakePower ? " MW" : "/min";
		return value.toFixed(2) + suffix;
	}

	return (nextProps) => {
		({ rate, item, onConfirm, isOutput } = nextProps);

		return (
			<div class="source-sink-rate-chooser">
				<form
					onSubmit={(ev) => {
						ev.preventDefault();
						onConfirm(value);
					}}
				>
					<ExpressionInput onChange={changeValue} />
				</form>
				<div class="display">
					{!isOutput && <img src={item.Icon} />}
					<div class="rate">
						<div class="num">{renderValue()}</div>
						<div class="ratio">{value === "unlimited" ? "" : value.toRatioString()}</div>
					</div>
					{isOutput && <img src={item.Icon} />}
				</div>
				<div class="dialog-buttons">
					<button onClick={() => onConfirm("unlimited")}>{isOutput ? "Maximize" : "Unlimited"}</button>
					<button onClick={() => onConfirm(null)}>Cancel</button>
					<button onClick={() => onConfirm(value)}>Ok</button>
				</div>
			</div>
		);
	};
};

export const chooseConstraintRate = (existingRate: BigRat | "unlimited", item: Item, isOutput: boolean) =>
	prompt<BigRat | "unlimited" | null>({
		title: "Choose new rate.",
		render: (onConfirm) => (
			<ConstraintRateChooser rate={existingRate} item={item} onConfirm={onConfirm} isOutput={isOutput} />
		),
	});
