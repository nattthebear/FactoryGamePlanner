type InputsFromSelectors<T extends (() => any)[]> = { [K in keyof T]: ReturnType<T[K]> };

function sequenceEqual(a: any[], b: any[]) {
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

export function createMemo<TInput extends (() => any)[], TReturn>(
	selector: (...inputs: InputsFromSelectors<TInput>) => TReturn,
	...inputSelectors: TInput
) {
	let prevInputs: InputsFromSelectors<TInput> | undefined;
	let prevOutput: TReturn;

	return () => {
		const inputs = inputSelectors.map((s) => s()) as InputsFromSelectors<TInput>;
		if (!prevInputs || !sequenceEqual(prevInputs, inputs)) {
			prevInputs = inputs;
			prevOutput = selector(...inputs);
		}
		return prevOutput;
	};
}
