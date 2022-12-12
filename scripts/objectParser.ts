import peggy from "peggy";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const grammar = peggy.generate(fs.readFileSync(`${__dirname}/object.peggy`, { encoding: "utf-8" }));

export function parseObject(input: string) {
	const result = grammar.parse(input);
	return result;
}
