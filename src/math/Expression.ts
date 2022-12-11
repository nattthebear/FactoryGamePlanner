import { BigRat } from "./BigRat";

type ParserSuccess<T> = { ok: true; index: number; value: T };
type ParserError = { ok: false; index: number; message: string };
export type ParserResult<T> = ParserSuccess<T> | ParserError;
type Parser<T> = (text: string, index: number) => ParserResult<T>;
type ParsedType<T> = T extends Parser<infer R> ? R : never;

const regex = (r: RegExp, message: string): Parser<RegExpMatchArray> => {
	if (!r.sticky || r.global) {
		throw new Error("Regex must be `y`, not `g`");
	}
	return (text, index) => {
		r.lastIndex = index;
		const match = text.match(r);
		if (!match) {
			return {
				ok: false,
				index,
				message,
			};
		}
		return {
			ok: true,
			index: r.lastIndex,
			value: match,
		};
	};
};

const seq =
	<T extends Parser<any>[]>(...parsers: T): Parser<{ [K in keyof T]: ParsedType<T[K]> }> =>
	(text, index) => {
		const res: any[] = [];
		for (const p of parsers) {
			const subres = p(text, index);
			if (!subres.ok) {
				return subres;
			}
			res.push(subres.value);
			index = subres.index;
		}
		return { ok: true, index, value: res as any };
	};

const array =
	<E, D>(element: Parser<E>, delimiter: Parser<D>): Parser<{ elements: E[]; delimiters: D[] }> =>
	(text, index) => {
		const elements: E[] = [];
		const delimiters: D[] = [];
		const head = element(text, index);
		if (!head.ok) {
			return head;
		}
		index = head.index;
		elements.push(head.value);
		while (true) {
			const d = delimiter(text, index);
			if (!d.ok) {
				break;
			}
			const e = element(text, d.index);
			if (!e.ok) {
				break;
			}
			delimiters.push(d.value);
			elements.push(e.value);
			index = e.index;
		}
		return { ok: true, index, value: { elements, delimiters } };
	};

const or =
	<T extends Parser<any>[]>(...parsers: T): Parser<ParsedType<T[number]>> =>
	(text, index) => {
		const results: ParserError[] = [];
		for (const p of parsers) {
			const res = p(text, index);
			if (res.ok) {
				return res;
			}
			results.push(res);
		}
		results.sort((x, y) => x.index - y.index);
		return results[0];
	};

const map =
	<A, B>(parser: Parser<A>, project: (value: A) => B): Parser<B> =>
	(input, index) => {
		const res = parser(input, index);
		if (!res.ok) {
			return res;
		}
		return {
			ok: true,
			index: res.index,
			value: project(res.value),
		};
	};

const mapBoth =
	<A, B>(parser: Parser<A>, project: (result: ParserSuccess<A>) => ParserResult<B>): Parser<B> =>
	(input, index) => {
		const res = parser(input, index);
		if (!res.ok) {
			return res;
		}
		return project(res);
	};

const defer =
	<T>(get: () => Parser<T>): Parser<T> =>
	(input, index) =>
		get()(input, index);

const Whitespace = regex(/ */iy, "Expected whitespace");

const opchain = <V, O>(item: Parser<V>, op: Parser<O>, collect: (x: V, y: V, op: O) => V): Parser<V> =>
	map(array(item, seq(Whitespace, op, Whitespace)), ({ elements, delimiters }) => {
		let value = elements[0];
		for (let i = 0; i < delimiters.length; i++) {
			value = collect(value, elements[i + 1], delimiters[i][1]);
		}
		return value;
	});

const Constant = map(regex(/(\d+(\.\d*)?|\d*(\.\d+))(e([+-])?(\d+))?/iy, "Expected a number"), (match) => {
	let toParse = match[1];
	if (match[3]) {
		toParse = "0" + toParse;
	} else if (match[2] === ".") {
		toParse = toParse + "0";
	}
	let value = BigRat.parse(toParse);
	const exp = match[6];
	if (exp) {
		let p = BigInt("1".padEnd(Number(exp) + 1, "0"));
		let q = 1n;
		if (match[5] === "-") {
			q = p;
			p = 1n;
		}
		value = value.mul(new BigRat(p, q));
	}
	return value;
});

const UnaryPlusMinus = map(seq(regex(/[+-]/y, "Expected a + or -"), Whitespace, Constant), ([sign, , value]) => {
	if (sign[0] === "-") {
		value = value.neg();
	}
	return value;
});

let P3_Circular: Parser<BigRat> = defer(() => P3);
const Parens = map(
	seq(regex(/\(/y, "Expected a ("), Whitespace, P3_Circular, Whitespace, regex(/\)/y, "Expected a (")),
	(results) => results[2]
);
const P1 = or(Constant, UnaryPlusMinus, Parens);
const P2 = opchain(P1, regex(/[*/]/y, "Expected a * or /"), (x, y, op) => (op[0] === "*" ? x.mul(y) : x.div(y)));
const P3 = opchain(P2, regex(/[+-]/y, "Expected a + or -"), (x, y, op) => (op[0] === "+" ? x.add(y) : x.sub(y)));

const Root = map(seq(Whitespace, P3, Whitespace, regex(/$/y, "Expected end of input")), (results) => results[1]);

export function evaluate(s: string) {
	return Root(s, 0);
}

export {};
