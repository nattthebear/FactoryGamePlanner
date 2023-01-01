import { BigRat } from "./BigRat";
import { parse, SyntaxError } from "./ExpressionParser";

interface ExpressionNode {
	type: string;
	offset: number;
}
interface ConstNode extends ExpressionNode {
	type: "const";
	value: string;
}
interface SciNotationNode extends ExpressionNode {
	type: "exp";
	value: string;
	child: ConstNode;
}
interface UnaryOpNode extends ExpressionNode {
	type: "uop";
	child: ConstNode | SciNotationNode;
	op: "+" | "-";
}
interface BinaryOpOp extends ExpressionNode {
	type: "+" | "-" | "*" | "/";
}
interface BinaryOpNode extends ExpressionNode {
	type: "binop";
	children: ExpressionRoot[];
	ops: BinaryOpOp[];
}
export type ExpressionRoot = ConstNode | SciNotationNode | UnaryOpNode | BinaryOpNode;

class EvalError extends Error {
	constructor(public location: number) {
		super();
	}
}

function evaluateNode(node: ExpressionRoot): BigRat {
	switch (node.type) {
		case "const": {
			let { value } = node;
			if (value.startsWith(".")) {
				value = "0" + value;
			}
			if (value.endsWith(".")) {
				value = value.slice(0, -1);
			}
			return BigRat.parse(value);
		}
		case "exp": {
			const exponent = Number(node.value);
			let factor = BigRat.ONE;
			if (exponent > 0) {
				factor = BigRat.create(Number("1".padEnd(exponent + 1, "0")), 1);
			} else if (exponent < 0) {
				factor = BigRat.create(1, Number("1".padEnd(-exponent + 1, "0")));
			}
			return evaluateNode(node.child).mul(factor);
		}
		case "uop": {
			let value = evaluateNode(node.child);
			if (node.op === "-") {
				value = value.neg();
			}
			return value;
		}
		case "binop": {
			let value = evaluateNode(node.children[0]);
			for (let i = 0; i < node.ops.length; i++) {
				const op = node.ops[i].type;
				const operand = evaluateNode(node.children[i + 1]);
				switch (op) {
					case "*":
						value = value.mul(operand);
						break;
					case "/":
						if (operand.eq(BigRat.ZERO)) {
							throw new EvalError(node.ops[i].offset);
						}
						value = value.div(operand);
						break;
					case "+":
						value = value.add(operand);
						break;
					case "-":
						value = value.sub(operand);
						break;
				}
			}
			return value;
		}
	}
}

export type EvalResult = { ok: true; value: BigRat } | { ok: false; message: string; offset: number };

export function evaluate(s: string): EvalResult {
	try {
		const ast: ExpressionRoot = parse(s);
		const value = evaluateNode(ast);
		return { ok: true, value };
	} catch (e) {
		if (e instanceof SyntaxError) {
			return {
				ok: false,
				message: "Parse error",
				offset: (e as import("peggy").parser.SyntaxError).location.start.offset,
			};
		}
		if (e instanceof EvalError) {
			return { ok: false, message: "Division by zero", offset: e.location };
		}
		throw e;
	}
}
