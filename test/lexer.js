var lexer = require('../lexer');

var expectedTokens = [
  // statements
  [
    // tokens
    { type: 'symbol', value: 'x' },
    { type: 'operator', value: 'assigment' },
    { type: 'object', value: 1 },
    { type: 'operator', value: 'addition' },
    { type: 'object', value: 1 },
  ],
];
var actualTokens = new Lexer().lex('x = 1 + 1');
