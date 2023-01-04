import { useEffect, useRef } from "preact/hooks";
import { useForceUpdate } from "./useForceUpdate";

export interface AbortablePromise<T> {
	promise: Promise<T>;
	abort(): void;
}

function idle() {
	return new Promise((resolve) => window.requestIdleCallback(resolve));
}

export function makeAbortablePromise<T>(
	iterator: Iterator<unknown, T, undefined>,
	maxSliceTime: number
): AbortablePromise<T> {
	let aborted = false;
	function abort() {
		aborted = true;
	}
	async function step() {
		for (let time = performance.now(); ; ) {
			const { done, value } = iterator.next();
			if (done) {
				return value;
			}
			if (performance.now() - time >= maxSliceTime) {
				await idle();
				if (aborted) {
					throw new Error("Operation aborted");
				}
				time = performance.now();
			}
		}
	}
	return { promise: step(), abort };
}

function arrayEqual<T extends any[]>(a: T, b: T) {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

export function useAbortableAsynchronousMemo<A extends any[], T>(
	factory: (...deps: A) => AbortablePromise<T>,
	deps: A
) {
	const { current } = useRef<{
		deps: A | undefined;
		value: T | undefined;
		wip: AbortablePromise<T> | undefined;
		catchable: Promise<void> | undefined;
	}>({
		deps: undefined,
		value: undefined,
		wip: undefined,
		catchable: undefined,
	});
	useEffect(() => {
		return () => {
			current.catchable?.catch(() => {});
			current.wip?.abort();
		};
	}, []);
	const forceUpdate = useForceUpdate();
	if (!current.deps || !arrayEqual(current.deps, deps)) {
		current.catchable?.catch(() => {});
		current.wip?.abort();
		const next = factory(...deps);
		current.deps = deps;
		current.wip = next;
		current.catchable = next.promise.then((value) => {
			if (current.wip === next) {
				current.value = value;
				current.wip = undefined;
				current.catchable = undefined;
				forceUpdate();
			}
		});
	}
	return { value: current.value, stale: !!current.wip };
}
