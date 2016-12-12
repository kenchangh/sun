var spc = "[\\t \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u3000]";


var eofDedent = `
// remaining DEDENTs implied by EOF, regardless of tabs/spaces
var tokens = [];

while (0 < yy._iemitstack[0]) {
  this.popState();
  tokens.unshift("DEDENT");
  yy._iemitstack.shift();
}
  
if (tokens.length) return tokens;
`;

var indent = `
var indentation = yytext.length - yytext.search(/\\s/) - 1;
if (indentation > yy._iemitstack[0]) {
  yy._iemitstack.unshift(indentation);
  return 'INDENT';
}

var tokens = [];

while (indentation < yy._iemitstack[0]) {
  this.popState();
  tokens.unshift("DEDENT");
  yy._iemitstack.shift();
}
if (tokens.length) return tokens;
`;


module.exports = {
  "lex": {
    "rules": [
     // ["\\n+",                           "yy.row++; return 'NEWLINE';"],
     ["If",                             "return 'IF';"],
     ["Then",                           "return 'THEN';"],
     ["Else",                           "return 'ELSE';"],
     ["EndIf",                          "return 'ENDIF';"],
     ["Print",                          "return 'PRINT';"],
     ["Enter",                          "return 'ENTER';"],
     ["[a-zA-Z_][a-zA-Z_0-9]*",         "return 'IDENTIFIER';"],
     ["\"[^\"]*\"|\'[^\']*'",           "yytext = yytext.substr(1,yyleng-2); return 'STRING';"],
     ["[0-9]+(?:\\.[0-9]+)?\\b",        "return 'FLOAT';"],
     ["[0-9]+\\b",                      "return 'INT';"],
     ["\\*",                            "return '*';"],
     ["\\/",                            "return '/';"],
     ["-",                              "return '-';"],
     ["\\+",                            "return '+';"],
     ["\\^",                            "return '^';"],
     ["\\(",                            "return '(';"],
     ["\\)",                            "return ')';"],
     ["=",                              "return '=';"],
     ["$",                              "return 'EOF';"],
     ["^\\s*$",                         eofDedent],
     ["\\n\\r]+"+spc+"*/![^\\n\\r]",    "/* eat blank lines */"],
     ["^[\\n\\r]"+spc+"*",              indent],
     [spc+"+",                          "/* skip whitespace */"],
    ]
  },

  "operators": [
    ["right", "="],
    // ["left", "==", "!="]
    ["left", "+", "-"],
    ["left", "*", "/"],
    ["left", "^"],
    ["left", "UMINUS"],
    ["right", "!"],
  ],

  "bnf": {
    "program": [
      ["proglist EOF", "return $1"],
    ],

    // "lines": [
    //   ["line",             "$$ = [$1];"],
    //   ["lines line",  "$$ = $1.concat($2);"],
    // ],

    // "line": [
    //   // disable expression-only lines, too many grammatical ambiguities
    //   // ["e",         "$$ = $1;"],
    //   ["statement",         "$$ = $1;"],
    //   ["statement NEWLINE", "$$ = $1;"],
    // ],

    "proglist": [
      ["stmt",          "$$ = [$stmt];"],
      ["proglist stmt", "$proglist.push($stmt); $$ = $proglist;"],
    ],

    "stmt": [
      ["if_stmt",         "$$ = $1;"],
      ["keyword_stmt",    "$$ = $1;"],
      ["assignment_stmt", "$$ = $1;"],
    ],

    "stmt_list": [
      ["stmt",            "$$ = [$stmt];"],
      ["stmt_list stmt",  "$stmt_list.push($stmt); $$ = $stmt_list;"]
    ],

    "stmt_block": [
      ["INDENT stmt_list DEDENT", "$$ = $stmt_list;"],
    ],

    "if_stmt": [
      ["IF e THEN stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $4, []);"],
      ["IF e THEN stmt_block ELSE stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $4, $6);"],
    ],

    "assignment_stmt": [
      ["variable = e", "$$ = new yy.Operation('assignment', $variable, $e);"]
    ],

    "keyword_stmt": [
      ["keyword e", "$$ = new yy.KeywordAction($1, $2);"],
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
      [ "e + e",   "$$ = new yy.Operation('addition', $1, $3);" ],
      [ "e - e",   "$$ = new yy.Operation('subtraction', $1, $3);" ],
      [ "e * e",   "$$ = new yy.Operation('multiplication', $1, $3);" ],
      [ "e / e",   "$$ = new yy.Operation('division', $1, $3);" ],
      [ "e ^ e",   "$$ = new yy.Operation('exponentiation', $1, $3);" ],
      // [ "e == e",  "$$ = yy.resolveVar($1) === yy.resolveVar($3);" ],
      // [ "e != e",  "$$ = yy.resolveVar($1) !== yy.resolveVar($3);" ],
      [ "- e",     "$$ = new yy.Operation('negation', $e);", {"prec": "UMINUS"} ],
      [ "( e )",   "$$ = $e;" ],
      [ "variable","$$ = $1" ],
      [ "STRING",  "$$ = yytext" ],
      [ "INT",     "$$ = parseInt(yytext, 10);" ],
      [ "FLOAT",   "$$ = parseFloat(yytext);" ],
    ],
  }
}
