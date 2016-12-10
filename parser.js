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
     ["Print",                      "return 'PRINT';"],
     ["Enter",                      "return 'ENTER';"],
     ["$",                          "return 'EOF';"]
    ]
  },

  "operators": [
    ["left", "+", "-"],
    ["left", "*", "/"],
    ["left", "^"],
    ["left", "UMINUS"],
    ["right", "!"],
  ],

  "bnf": {
    "expressions": [["statement EOF", "return $1"]],

    "statement": [
      ["e",               "return $1;"],
      // ["variable = e",    "$$ = new yy.Value('assignment', $1, $3);"],
    ],

    "variable": [
      ["identifier",              "$$ = new yy.Value('variable', $1);"],
      // ["variable [ expression ]", "$$ = $1; $$.indices.push($3);"]
    ],

    "identifier": [
      ["IDENTIFIER", "$$ = yytext;"]
    ],

    // "expressions": [[ "e EOF", "return $1;"  ]],

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

// var parserSource = parser.generate();

module.exports = parser;
