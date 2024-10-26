import { TPC } from "vdomk";
import { BigRat } from "../math/BigRat";
import { autoFocusAndSelect } from "../hook/autoFocus";
import { EvalResult, evaluate, unevaluate } from "../math/Expression";

import "./ExpressionInput.css";

export type ExpressionInputValue =
	| {
			text: string;
			value: BigRat;
			error: false;
			message: null;
			offset: null;
	  }
	| {
			text: string;
			value: null;
			error: true;
			message: string;
			offset: number | null;
	  };

export function evaluateToInputValue(text: string): ExpressionInputValue {
	if (!text) {
		return {
			text,
			value: null,
			error: true,
			message: "Enter a number or expression.",
			offset: null,
		};
	}
	const res = evaluate(text);
	if (res.ok) {
		return { text, value: res.value, error: false, message: null, offset: null };
	} else {
		return { text, value: null, error: true, message: res.message, offset: res.offset };
	}
}

export function unevaluateToInputValue(num: BigRat): ExpressionInputValue {
	return evaluateToInputValue(unevaluate(num));
}

export interface ExpressionInputProps {
	inputValue: ExpressionInputValue;
	onChange(newValue: ExpressionInputValue): void;
	onSubmit(): void;
}

export const ExpressionInput: TPC<ExpressionInputProps> = (_, instance) => {
	return ({ inputValue, onChange, onSubmit }) => {
		const { text, value, error, message, offset } = inputValue;

		const underlay = offset != null && (
			<span class="underlay">
				{" ".repeat(offset)}
				<span class="error"> </span>
			</span>
		);

		const lowertext = (
			<span class="lower-text">
				<span class={error ? "error" : undefined}>{message || "\u00a0"}</span>
			</span>
		);

		return (
			<form
				class="expression-input"
				onSubmit={(ev) => {
					ev.preventDefault();
					if (value) {
						onSubmit();
					}
				}}
			>
				{underlay}
				<input
					type="text"
					ref={autoFocusAndSelect}
					value={text}
					onInput={(ev) => {
						onChange(evaluateToInputValue(ev.currentTarget.value));
					}}
				/>
				{lowertext}
			</form>
		);
	};
};
