const MOCK_PROTOCOLS = ["url:", "data-url:"];

export function resolve(specifier, context, nextResolve) {
	if (MOCK_PROTOCOLS.some((p) => specifier.startsWith(p))) {
		return {
			shortCircuit: true,
			url: specifier,
		};
	}
	return nextResolve(specifier);
}

export function load(url, context, nextLoad) {
	if (MOCK_PROTOCOLS.some((p) => url.startsWith(p))) {
		return {
			format: "module",
			shortCircuit: true,
			source: `const url = ${JSON.stringify("MOCKED" + url)};\nexport default url;\n`,
		};
	}
	return nextLoad(url);
}
