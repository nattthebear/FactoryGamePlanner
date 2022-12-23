import "../src/immer";

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
