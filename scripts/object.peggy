Value
	= Array / Object / ClassString / QuotedString / String

Array
	= "(" head:Value tail:("," v:Value { return v; })* ")" { return [head, ...tail]; }

KVPair =
	k:String "=" v:Value { return [k, v]; }

Object
	= "(" head:KVPair tail:("," v:KVPair { return v; })* ")" { return Object.fromEntries([head, ...tail]); }

// What is this?
ClassPrefix
	= "/" [A-Za-z/]+ { return text(); }
Class
	= [A-Za-z]+ { return text(); }
ClassContent
	= [^'"]+ { return text(); }
ClassString
	= clazzPrefix:ClassPrefix "." clazz:Class "'\"" data:ClassContent "\"'" { return clazz + " " + data; }

QuotedString
	= "\"" @([^"]* { return text(); }) "\""

String
	= [^()=,]* { return text(); }
