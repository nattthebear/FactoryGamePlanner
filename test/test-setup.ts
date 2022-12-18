import { enableMapSet } from "immer";
enableMapSet();

const gg = global as any;

gg.window = {
	location: {
		search: "",
	},
};

gg.document = {
	addEventListener() {},
	documentElement: {
		addEventListener() {},
	},
};
