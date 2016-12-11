var readlineSync = require('readline-sync');
var grammar = require('./grammar');
var Parser = require('jison').Parser;
var objects = require('./objects');


var parser = new Parser(grammar);
var yy = parser.yy;

yy.context = {};

yy.Assignment = function (left, right) {
  yy.context[left.name] = right;
  return new objects.Assignment(left, right);
};

yy.Variable = objects.Variable;

yy.KeywordAction = function (keyword, expression) {
  switch (keyword) {
    case 'Print':
      var value = expression.type === 'variable'
        ? yy.resolveVar(expression)
        : expression;
      console.log(value);
      break;
    case 'Enter':
      var varName = expression.name;
      var answer = readlineSync.question('');
      var val = parseFloat(answer);
      val = isNaN(val) ? answer : val;
      new yy.Assignment(new yy.Variable(varName), val);
      break;
    default:
      break;
  }
  return new objects.KeywordAction(keyword, expression);
}

yy.resolveVar = function resolveVar(expression) {
  if (expression.type === 'variable') {
    return yy.context[expression.name];
  }
  return expression;
}

module.exports = parser;
