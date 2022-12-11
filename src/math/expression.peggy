{
	const node = (type, props) => ({ type, offset: offset(), ...props }); 
}

Root = Whitespace v:P3 Whitespace { return v; }

SimpleConstant
	= value:$([0-9]* "." [0-9]* / [0-9]+) { return node("const", { value }); }
ExpConstant
	= child:SimpleConstant [eE] value:$([+-]? [0-9]+) { return node("exp", { value, child }); }

Parens = "(" Whitespace v:P3 Whitespace ")" { return v; }

P0 = ExpConstant / SimpleConstant / Parens

UnaryOp
	= op:[+-] Whitespace child:P0 { return node("uop", { child, op }); }

P1 = P0 / UnaryOp

MulDiv =
	head:P1
	tail:(Whitespace d:([*/] { return node(text()); }) Whitespace v:P1 { return { d, v }; })+
	{ return node("binop", { children: [head, ...tail.map(t => t.v)], ops: tail.map(t => t.d) }); }

P2 = MulDiv / P1

AddSub =
	head:P2
	tail:(Whitespace d:([+-] { return node(text()); }) Whitespace v:P2 { return { d, v }; })+
	{ return node("binop", { children: [head, ...tail.map(t => t.v)], ops: tail.map(t => t.d) }); }

P3 = AddSub / P2

Whitespace = [ ]*
