var readline = require('readline');
var Parser = require('jison').Parser;
// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

var grammar = {
  "lex": {
    "rules": [
     ["\\s+",                       "/* skip whitespace */"],
     ["\\n+",                       "NEWLINE"],
     ["[a-zA-Z_][a-zA-Z_0-9]*",     "return 'IDENTIFIER'"],
     ["[0-9]+(?:\\.[0-9]+)?\\b",    "return 'FLOAT';"],
     ["[0-9]+\\b",                  "return 'INT';"],
     ["\\*",                        "return '*';"],
     ["\\/",                        "return '/';"],
     ["-",                          "return '-';"],
     ["\\+",                        "return '+';"],
     ["\\^",                        "return '^';"],
     ["\\(",                        "return '(';"],
     ["\\)",                        "return ')';"],
     ["=",                          "return '=';"],
     ["Print",                      "return 'PRINT';"],
     ["Enter",                      "return 'ENTER';"],
     ["$",                          "return 'EOF';"],
    ]
  },

  "operators": [
    ["right", "="],
    ["left", "+", "-"],
    ["left", "*", "/"],
    ["left", "^"],
    ["left", "UMINUS"],
    ["right", "!"],
  ],

  "bnf": {
    "program": [
      ["statements EOF", "return $1"],
    ],

    "statements": [
      ["statement",             "$$ = [$1];"],
      ["statement NEWLINE",     "$$ = [$1];"],
      ["statements statement",  "$$ = $1.concat($2);"],
    ],

    "statement": [
      ["e",               "$$ = $1;"],
      ["variable = e",    "$$ = new yy.Value('assignment', $1, $3);"],
    ],

    "variable": [
      ["identifier",              "$$ = new yy.Value('variable', yytext)"],
      // ["variable [ expression ]", "$$ = $1; $$.indices.push($3);"]
    ],

    "identifier": [
      ["IDENTIFIER", "$$ = yytext;"],
    ],

    "e": [
      [ "e + e",   "$$ = $1 + $3;" ],
      [ "e - e",   "$$ = $1 - $3;" ],
      [ "e * e",   "$$ = $1 * $3;" ],
      [ "e / e",   "$$ = $1 / $3;" ],
      [ "e ^ e",   "$$ = Math.pow($1, $3);" ],
      [ "- e",     "$$ = -$2;", {"prec": "UMINUS"} ],
      [ "( e )",   "$$ = $2;" ],
      [ "INT",     "$$ = parseInt(yytext, 10);" ],
      [ "FLOAT",   "$$ = parseFloat(yytext, 10);" ],
    ],
  }
}

var parser = new Parser(grammar);

var yy = parser.yy;

yy.Value = function (type) {
  this.type = type;
  switch (this.type) {
    case 'variable':
      this.name = arguments[1];
      this.indices = [];
      break;
    case "assignment":
      this.left = arguments[1];
      this.right = arguments[2];
      break;
    default:
      break;
  }
};

module.exports = parser;
