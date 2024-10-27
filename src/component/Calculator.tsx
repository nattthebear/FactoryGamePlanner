import { effect, TPC } from "vdomk";
import { makeStore } from "../MakeStore";
import { BigRat } from "../math/BigRat";
import { evaluateToInputValue, ExpressionInput, ExpressionInputValue } from "./ExpressionInput";
import { prompt } from "./Prompt";

import "./Calculator.css";

interface State {
	history: {
		text: string;
		value: BigRat;
	}[];
	currentValue: ExpressionInputValue;
}

const emptyValue = evaluateToInputValue("");

const defaultState: State = {
	// history: [],
	history: Array.from({ length: 200 }).map((_, i) => ({
		text: i.toString(),
		value: evaluateToInputValue(i.toString()).value!,
	})),
	currentValue: emptyValue,
};

const { useSelector, update, replace } = makeStore<State>(defaultState, "_CalculatorStore");

const Calculator: TPC<{ close: () => void }> = (_, instance) => {
	const getState = useSelector(instance, (v) => v);

	let historyScroll: HTMLElement | null;
	function acceptHistoryScroll(value: HTMLElement | null) {
		historyScroll = value;
	}
	let shouldScroll = false;

	function onChange(newValue: ExpressionInputValue) {
		update((draft) => {
			draft.currentValue = newValue;
		});
	}
	function onSubmit() {
		update((draft) => {
			if (draft.currentValue.value) {
				draft.history.push({ text: draft.currentValue.text, value: draft.currentValue.value });
				draft.currentValue = emptyValue;
				shouldScroll = true;
			}
		});
	}
	function clear() {
		replace(defaultState);
	}

	return ({ close }) => {
		const { history, currentValue } = getState();
		effect(instance, () => {
			if (historyScroll && shouldScroll) {
				shouldScroll = false;
				historyScroll.scrollTop = historyScroll.scrollHeight;
			}
		});

		return (
			<>
				<div class="calculator">
					<div class="history monospace" ref={acceptHistoryScroll}>
						{history.map(({ text, value }) => {
							return (
								<div class="history-item">
									<div class="entry">{text}</div>
									<div class="result" data-tooltip={value.toRatioString()}>
										{value.toFixed(4)}
									</div>
								</div>
							);
						})}
					</div>
					<div class="expression-wrap">
						<ExpressionInput inputValue={currentValue} onChange={onChange} onSubmit={onSubmit} />
					</div>
					<div class="results monospace">
						<div class="num">{(currentValue.value && currentValue.value.toFixed(4)) || "\u00a0"}</div>
						<div class="ratio">
							{(currentValue.value && currentValue.value.toRatioString()) || "\u00a0"}
						</div>
					</div>
				</div>
				<div class="dialog-buttons">
					<button onClick={clear}>Clear</button>
					<button onClick={close}>Close</button>
				</div>
			</>
		);
	};
};

export const runCalculator = () =>
	prompt<void>({ title: "Calculator", render: (onConfirm) => <Calculator close={onConfirm} /> });
