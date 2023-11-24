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

import "./App";
