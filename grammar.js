var whitespace = "[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]";

module.exports = {
  "lex": {
    "rules": [
     [" +",                       "/* skip whitespace */"],
     ["\\n+",                       "yy.row++; return 'NEWLINE';"],
     ["Print",                      "return 'PRINT';"],
     ["Enter",                      "return 'ENTER';"],
     ["[a-zA-Z_][a-zA-Z_0-9]*",     "return 'IDENTIFIER';"],
     ["\"[^\"]*\"|\'[^\']*'", "yytext = yytext.substr(1,yyleng-2); return 'STRING';"],
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

    // "block": [
    //   [""]
    // ],

    "lines": [
      ["line",             "$$ = [$1];"],
      ["lines line",  "$$ = $1.concat($2);"],
    ],

    "line": [
      // disable expression-only lines, too many grammatical ambiguities
      // ["e",         "$$ = $1;"],
      ["statement",         "$$ = $1;"],
      ["statement NEWLINE", "$$ = $1;"],
    ],

    "statement": [
      ["variable = e",    "$$ = new yy.Assignment($1, $3);"],
      ["keyword e",       "$$ = new yy.KeywordAction($1, $2);"],
    ],

    "keyword": [
      ["PRINT", "$$ = yytext;"],
      ["ENTER", "$$ = yytext;"],
    ],

    "variable": [
      ["identifier",              "$$ = new yy.Variable(yytext)"],
      // ["variable [ expression ]", "$$ = $1; $$.indices.push($3);"]
    ],

    "identifier": [
      ["IDENTIFIER", "$$ = yytext;"],
    ],

    "e": [
      [ "e + e",   "$$ = yy.resolveVar($1) + yy.resolveVar($3);" ],
      [ "e - e",   "$$ = yy.resolveVar($1) - yy.resolveVar($3);" ],
      [ "e * e",   "$$ = yy.resolveVar($1) * yy.resolveVar($3);" ],
      [ "e / e",   "$$ = yy.resolveVar($1) / yy.resolveVar($3);" ],
      [ "e ^ e",   "$$ = Math.pow(yy.resolveVar($1), yy.resolveVar($3));" ],
      [ "- e",     "$$ = -yy.resolveVar($2);", {"prec": "UMINUS"} ],
      [ "( e )",   "$$ = yy.resolveVar($2);" ],
      [ "variable","$$ = $1" ],
      [ "STRING",  "$$ = yytext" ],
      [ "INT",     "$$ = parseInt(yytext, 10);" ],
      [ "FLOAT",   "$$ = parseFloat(yytext);" ],
    ],
  }
}
