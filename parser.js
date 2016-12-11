var readline = require('readline');
var Parser = require('jison').Parser;
// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

var grammar = {
  "lex": {
    "rules": [
     [" +",                       "/* skip whitespace */"],
     ["\\n+",                       "return 'NEWLINE';"],
     ["[a-zA-Z_][a-zA-Z_0-9]*",     "return 'IDENTIFIER';"],
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
      ["lines EOF", "return $1"],
    ],

    "lines": [
      ["line",             "$$ = [$1];"],
      ["line NEWLINE",     "$$ = [$1];"],
      ["lines line",  "$$ = $1.concat($2);"],
    ],

    "line": [
      // ["e",         "$$ = $1;"],
      ["statement", "$$ = $1;"],
    ],

    "statement": [
      ["variable = e",    "$$ = new yy.Assignment($1, $3);"],
    ],

    "variable": [
      ["identifier",              "$$ = new yy.Variable(yytext)"],
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
      [ "variable","$$ = $1" ],
      [ "INT",     "$$ = parseInt(yytext, 10);" ],
      [ "FLOAT",   "$$ = parseFloat(yytext, 10);" ],
    ],
  }
}

var parser = new Parser(grammar);

var yy = parser.yy;

yy.Assignment = function Assignment(left, right) {
  this.type = 'assignment';
  this.left = left;
  this.right = right;
};

yy.Variable = function Variable(name) {
  this.type = 'variable';
  this.name = name;
  this.indices = [];
};

module.exports = parser;
