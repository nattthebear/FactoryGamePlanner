if (!Array.prototype.at) {
	Object.defineProperty(Array.prototype, "at", {
		configurable: true,
		enumerable: false,
		value: function at(index: number) {
			const { length } = this;
			if (index < 0) {
				index += length;
			}
			if (index >= 0 && index < length) {
				return this[index];
			}
		},
	});
}

if (!window.requestIdleCallback) {
	window.requestIdleCallback = function requestIdleCallback(callback, options) {
		return window.setTimeout(callback, options?.timeout ?? 50);
	};
	window.cancelIdleCallback = function cancelIdleCallback(handle) {
		window.clearTimeout(handle);
	};
}

import "./immer";

import "modern-normalize/modern-normalize.css";

import "./App";
