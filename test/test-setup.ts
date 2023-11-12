import "../src/immer";

const gg = global as any;

gg.window = {
	location: {
		search: "",
		hash: "",
	},
};

gg.document = {
	addEventListener() {},
	documentElement: {
		addEventListener() {},
	},
};
