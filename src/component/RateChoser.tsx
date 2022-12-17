import produce from "immer";
import { useEffect, useRef, useState } from "preact/hooks";
import { BigRat } from "../math/BigRat";
import { evaluate } from "../math/Expression";
import { Flow } from "../store/Common";
import { ProductionBuilding, Sink, Source } from "../store/Producers";
import { prompt } from "./Prompt";

import "./RateChooser.css";

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
			message: `${res.value.toNumberApprox().toFixed(1)} is negative.`,
			offset: null,
		};
	}
	return { value: res.value, error: false, message: null, offset: null };
}

function ExpressionInput({ onChange }: { onChange: (value: BigRat) => void }) {
	const [text, changeText] = useState("");
	const [evalRes, changeEvalRes] = useState(evaluateAndVerify(""));
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		inputRef.current!.focus();
	}, []);

	const underlay = evalRes.offset != null && (
		<span class="underlay">
			{" ".repeat(evalRes.offset)}
			<span class="error"> </span>
		</span>
	);

	const lowertext = (
		<span class="lower-text">
			<span class={evalRes.error ? "error" : undefined}>{evalRes.message}</span>
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
					changeText(newText);
					changeEvalRes(newEvalResult);
					if (newEvalResult.value) {
						onChange(newEvalResult.value);
					}
				}}
			/>
			{lowertext}
		</div>
	);
}

function BuildingRateChooser({
	producer,
	onConfirm,
}: {
	producer: ProductionBuilding;
	onConfirm: (newValue: BigRat) => void;
}) {
	const [value, changeValue] = useState(producer.rate);

	const newProducer = produce(producer, (draft) => {
		draft.rate = value;
	});

	const renderFlow = (flow: Flow) => (
		<div class="flow">
			<img src={flow.item.Icon} />
			<span>{flow.rate.toNumberApprox().toFixed(2)}/min</span>
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
					<span class="num">{value.toNumberApprox().toFixed(2)}x</span>
					<span class="ratio">{value.toRatioString()}</span>
				</div>
				<div class="flows">{newProducer.outputFlows().map(renderFlow)}</div>
			</div>
		</div>
	);
}

function SourceSinkRateChooser({
	producer,
	onConfirm,
}: {
	producer: Sink | Source;
	onConfirm: (newValue: BigRat) => void;
}) {
	const [value, changeValue] = useState(producer.rate);

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
					<div class="num">{value.toNumberApprox().toFixed(2)}/min</div>
					<div class="ratio">{value.toRatioString()}</div>
				</div>
				{renderFlows(newProducer.outputFlows())}
			</div>
		</div>
	);
}

export const chooseBuildingRate = (producer: ProductionBuilding) =>
	prompt<BigRat>({
		title: "Choose new rate.",
		render: (onConfirm) => <BuildingRateChooser producer={producer} onConfirm={onConfirm} />,
	});

export const chooseSourceSinkRate = (producer: Source | Sink) =>
	prompt<BigRat>({
		title: "Choose new rate.",
		render: (onConfirm) => <SourceSinkRateChooser producer={producer} onConfirm={onConfirm} />,
	});
