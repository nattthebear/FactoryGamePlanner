Value
	= Array / Object / String

Array
	= "(" head:Value tail:("," v:Value { return v; })* ")" { return [head, ...tail]; }

KVPair =
	k:String "=" v:Value { return [k, v]; }

Object
	= "(" head:KVPair tail:("," v:KVPair { return v; })* ")" { return Object.fromEntries([head, ...tail]); }

String
	= [^()=,]* { return text(); }
