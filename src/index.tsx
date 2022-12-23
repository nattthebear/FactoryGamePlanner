import "./immer";

import "modern-normalize/modern-normalize.css";

if (!window.requestIdleCallback) {
	window.requestIdleCallback = function requestIdleCallback(callback, options) {
		return window.setTimeout(callback, options?.timeout ?? 50);
	};
	window.cancelIdleCallback = function cancelIdleCallback(handle) {
		window.clearTimeout(handle);
	};
}

(async () => {
	if (process.env.NODE_ENV === "development") {
		await import("preact/debug" as any);
	}
	await import("./App");
})();
