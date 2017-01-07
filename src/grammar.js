var spc = "[\\t \\u00a0\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u3000]";

module.exports = {
  "lex": {
    "rules": [
     // ["\\n+",                           "yy.row++; return 'NEWLINE';"],
     ["If\\b",                             "return 'IF';"],
     ["Then\\b",                           "return 'THEN';"],
     ["Else\\b",                           "return 'ELSE';"],
     ["EndIf\\b",                          "return 'ENDIF';"],
     ["(EndLoop|LoopEnd|Loop-[Ee]nd)\\b",  "return 'END_LOOP';"],
     ["Loop\\b",                           "return 'LOOP';"],
     ["to\\b",                             "return 'TO';"],
     ["(EndWhile|WhileEnd)\\b",            "return 'END_WHILE';"],
     ["While\\b",                          "return 'WHILE';"],
     ["End\\b",                            "return 'END';"],
     ["Return\\b",                         "return 'RETURN';"],
     ["Print\\b",                          "return 'PRINT';"],
     ["Enter\\b",                          "return 'ENTER';"],
     ["AND\\b",                            "return 'AND';"],
     ["OR\\b",                             "return 'OR';"],
     ["\"[^\"]*\"|\'[^\']*'",              "yytext = yytext.substr(1,yyleng-2); return 'STRING';"],
     ["(True|False)",                      "return 'BOOL'"],
     ["[0-9]+(?:\\.[0-9]+)?\\b",           "return 'FLOAT';"],
     ["[0-9]+\\b",                         "return 'INT';"],
     ["[a-zA-Z_][a-zA-Z_0-9]*\\b",         "return 'IDENTIFIER';"],
     ["\\(",                               "return '(';"],
     ["\\)",                               "return ')';"],
     [",",                                 "return ',';"],
     ["\\*",                               "return '*';"],
     ["\\/",                               "return '/';"],
     ["-",                                 "return '-';"],
     ["\\+",                               "return '+';"],
     ["\\^",                               "return '^';"],
     ["\\[",                               "return '[';"],
     ["\\]",                               "return ']';"],
     ["%",                                 "return '%';"],
     [">=",                                "return '>=';"],
     ["<=",                                "return '<=';"],
     [">",                                 "return '>';"],
     ["<",                                 "return '<';"],
     ["==",                                "return '==';"],
     ["!=",                                "return '!=';"],
     ["=",                                 "return '=';"],
     ["!",                                 "return '!';"],
     [":",                                 "return ':';"],
     ["$",                                 "return 'EOF';"],
     ["[\\n\\r]+",                         "return 'NEWLINE';"],
     [spc+"+",                             "/* skip whitespace */"],
    ]
  },

  "operators": [
    ["right", "="],
    ["left", "AND", "OR"],
    ["left", "==", "!="],
    ["left", "<", ">", "<=", ">="],
    ["left", "+", "-"],
    ["left", "*", "/", "%"],
    ["left", "^"],
    ["left", "UMINUS"],
    ["right", "!"],
  ],

  "bnf": {
    "program": [
      ["proglist EOF", "return $1"],
    ],

    "proglist": [
      // ["stmt",          "$$ = [$stmt];"],
      ["stmt NEWLINE",          "$$ = [$stmt];"],
      ["proglist stmt NEWLINE", "$proglist.push($stmt); $$ = $proglist;"],
    ],

    "stmt": [
      ["function_stmt",   "$$ = $1;"],
      ["if_stmt",         "$$ = $1;"],
      ["keyword_stmt",    "$$ = $1;"],
      ["assignment_stmt", "$$ = $1;"],
      ["loop_stmt",       "$$ = $1;"],
      ["while_stmt",      "$$ = $1;"],
      ["e",               "$$ = $1;"],
    ],

    "stmt_list": [
      ["stmt NEWLINE",            "$$ = [$stmt];"],
      ["stmt_list stmt NEWLINE",  "$stmt_list.push($stmt); $$ = $stmt_list;"]
    ],

    "stmt_block": [
      ["NEWLINE stmt_list", "$$ = $stmt_list;"],
    ],

    "function_stmt": [
      [
        "identifier ( params ) stmt_block END",
        "$$ = new yy.FunctionStmt($identifier, $params, $stmt_block);"
      ]
    ],

    "params": [
      ["",                "$$ = [];"],
      ["param",           "$$ = [$param];"],
      ["params , param",  "$params.push($param); $$ = $params;"]
    ],

    "param": [
      ["identifier", "$$ = new yy.FunctionParam($identifier);"],
    ],

    "while_stmt": [
      [
        "WHILE e stmt_block END_WHILE",
        "$$ = new yy.WhileStmt($e, $stmt_block);"
      ]
    ],

    "loop_stmt": [
      [
        "LOOP : variable = e TO e stmt_block END_LOOP : variable",
        "$$ = new yy.LoopStmt($3, $11, $5, $7, $stmt_block);"
      ],
    ],

    "if_stmt": [
      ["IF e THEN stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $4, []);"],
      ["IF e NEWLINE THEN stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $5, []);"],
      ["IF e THEN stmt_block ELSE stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $4, $6);"],
      ["IF e NEWLINE THEN stmt_block ELSE stmt_block ENDIF", "$$ = new yy.IfElseStmt($e, $5, $7);"],
    ],

    "assignment_stmt": [
      ["variable = e", "$$ = new yy.Operation('assignment', $variable, $e);"]
    ],

    "keyword_stmt": [
      ["keyword e", "$$ = new yy.KeywordAction($1, $2);"],
    ],

    "keyword": [
      ["PRINT",   "$$ = yytext;"],
      ["ENTER",   "$$ = yytext;"],
      ["RETURN",  "$$ = yytext;"],
    ],

    "variable": [
      ["identifier",              "$$ = new yy.Variable($identifier);"],
      ["identifier indices",      "$$ = new yy.Variable($identifier, $indices);"]
    ],

    "indices": [
      ["index",         "$$ = [$index]"],
      ["indices index", "$indices.push($index); $$ = $indices;"],
    ],

    "index": [
      ["[ e ]", "$$ = $e"]
    ],

    "identifier": [
      ["IDENTIFIER", "$$ = yytext;"],
    ],

    "list": [
      ["",                  "$$ = [];"],
      ["e",                 "$$ = [$e];"],
      ["list , e",          "$list.push($e); $$ = $list;"],
    ],

    "e": [
      ["variable",  "$$ = $1" ],
      ["identifier ( list )", "$$ = new yy.FunctionCall($identifier, $list)"],
      ["( e )",     "$$ = $e;"],
      ["e + e",     "$$ = new yy.Operation('addition', $1, $3);"],
      ["e - e",     "$$ = new yy.Operation('subtraction', $1, $3);"],
      ["e * e",     "$$ = new yy.Operation('multiplication', $1, $3);"],
      ["e / e",     "$$ = new yy.Operation('division', $1, $3);"],
      ["e ^ e",     "$$ = new yy.Operation('exponentiation', $1, $3);"],
      ["e % e",     "$$ = new yy.Operation('modulo', $1, $3);"],
      ["e AND e",   "$$ = new yy.Operation('conjunction', $1, $3);"],
      ["e OR e",    "$$ = new yy.Operation('disjunction', $1, $3);"],
      ["e == e",    "$$ = new yy.Operation('equal', $1, $3);"],
      ["e != e",    "$$ = new yy.Operation('inequal', $1, $3);"],
      ["e > e",     "$$ = new yy.Operation('gt', $1, $3);"],
      ["e < e",     "$$ = new yy.Operation('lt', $1, $3);"],
      ["e >= e",    "$$ = new yy.Operation('gte', $1, $3);"],
      ["e <= e",    "$$ = new yy.Operation('lte', $1, $3);"],
      ["! e",       "$$ = new yy.Operation('inversion', $e);"],
      ["- e",       "$$ = new yy.Operation('negation', $e);", {"prec": "UMINS"}],
      ["BOOL",      "$$ = yytext === 'True' ? true : false;"],
      ["STRING",    "$$ = yytext"],
      ["INT",       "$$ = parseInt(yytext, 10);"],
      ["FLOAT",     "$$ = parseFloat(yytext);"],
    ],
  }
}
