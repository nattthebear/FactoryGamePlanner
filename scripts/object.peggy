Value
	= Array / Object / ClassString / String

Array
	= "(" head:Value tail:("," v:Value { return v; })* ")" { return [head, ...tail]; }

KVPair =
	k:String "=" v:Value { return [k, v]; }

Object
	= "(" head:KVPair tail:("," v:KVPair { return v; })* ")" { return Object.fromEntries([head, ...tail]); }

// What is this?
Class
	= [A-Za-z]+ { return text(); }
ClassContent
	= [^'"]+ { return text(); }
ClassString
	= clazz:Class "'\"" data:ClassContent "\"'" { return clazz + " " + data; }

String
	= [^()=,]* { return text(); }
