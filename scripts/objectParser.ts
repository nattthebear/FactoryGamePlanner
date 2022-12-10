import * as peggy from "peggy";
import * as fs from "fs";

const grammar = peggy.generate(fs.readFileSync(`${__dirname}/object.peggy`, { encoding: "utf-8" }));

export function parseObject(input: string) {
	const result = grammar.parse(input);
	return result;
}
