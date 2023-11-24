import { LayerInstance, cleanup, scheduleUpdate } from "vdomk";

export interface AbortablePromise<T> {
	promise: Promise<T>;
	abort(): void;
}

function idle() {
	return new Promise((resolve) => window.requestIdleCallback(resolve));
}

export function makeAbortablePromise<T>(
	iterator: Iterator<unknown, T, undefined>,
	maxSliceTime: number,
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
	instance: LayerInstance,
	factory: (...deps: A) => AbortablePromise<T>,
) {
	let prevDeps: A | undefined;
	let prevValue: T | undefined;

	let wip: AbortablePromise<T> | undefined;
	let catchable: Promise<void> | undefined;

	cleanup(instance, () => {
		catchable?.catch(() => {});
		wip?.abort();
	});

	return (deps: A) => {
		if (!prevDeps || !arrayEqual(prevDeps, deps)) {
			catchable?.catch(() => {});
			wip?.abort();
		}

		const next = factory(...deps);
		prevDeps = deps;
		wip = next;
		catchable = next.promise.then((value) => {
			if (wip === next) {
				prevValue = value;
				wip = undefined;
				catchable = undefined;
				scheduleUpdate(instance);
			}
		});

		return { value: prevValue, stale: !!wip };
	};
}
