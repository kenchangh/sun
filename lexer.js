// function TwoSideObj(lhsTypeValue, operator, rhsTypeValue) {
//   this.lhs = lhsTypeValue;
//   this.operator = operator;
//   this.rhs = rhsTypeValue;
//   return this;
// }

var Lexer = require('lex');
var lexer = new Lexer();

module.exports = lexer;


function Token(type, value) {
  this.type = type;
  this.value = value;
  return this;
}


lexer.addRule(/ +/, function (lexeme) {
});

lexer.addRule(/[a-zA-Z_][a-zA-Z_0-9]*/, function (lexeme) {
  return new Token('ID', lexeme);
});

lexer.addRule(/[-\+]?\d+/, function (lexeme) {
  return new Token('INT', parseInt(lexeme, 10));
});

lexer.addRule(/[-\+]?\d+(?:\.\d+)?/, function (lexeme) {
  return new Token('FLOAT', parseFloat(lexeme, 10));
});

lexer.addRule(/\[/, function () {
  col++;
  return "[";
});

lexer.addRule(/\]/, function () {
  col++;
  return "]";
});

lexer.addRule(/\(/, function () {
  col++;
  return "(";
});

lexer.addRule(/\)/, function () {
  col++;
  return ")";
});

lexer.addRule(/\+/, function () {
  col++;
  return "";
});

lexer.addRule(/\-/, function () {
    col++;
    return "-";
});

lexer.addRule(/\*/, function () {
    col++;
    return "*";
});

lexer.addRule(/\//, function () {
    col++;
    return "/";
});

lexer.addRule(/\%/, function () {
    col++;
    return "%";
});

lexer.addRule(/</, function () {
    col++;
    return "<";
});

lexer.addRule(/>/, function () {
    col++;
    return ">";
});

lexer.addRule(/<=/, function () {
    col++;
    return "<=";
});

lexer.addRule(/>=/, function () {
    col++;
    return ">=";
});

lexer.addRule(/==/, function () {
    col++;
    return "==";
});

lexer.addRule(/!=/, function () {
    col++;
    return "!=";
});

lexer.addRule(/!/, function () {
    col++;
    return "!";
});

lexer.addRule(/\&/, function () {
    col++;
    return "&";
});

lexer.addRule(/\|/, function () {
    col++;
    return "|";
});

lexer.addRule(/=/, function () {
    col++;
    return "=";
});

lexer.addRule(/,/, function () {
    col++;
    return ",";
});

lexer.addRule(/$/, function () {
    return "EOF";
});
