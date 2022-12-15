import { enableMapSet } from "immer";
enableMapSet();

import "modern-normalize/modern-normalize.css";

(async () => {
	if (process.env.NODE_ENV === "development") {
		await import("preact/debug" as any);
	}
	await import("./App");
})();
