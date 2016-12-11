var readlineSync = require('readline-sync');
var grammar = require('./grammar');
var Parser = require('jison').Parser;


var parser = new Parser(grammar);
var yy = parser.yy;

yy.context = {};

yy.Assignment = function Assignment(left, right) {
  this.type = 'assignment';
  this.left = left; // variable
  this.right = right; // expression
  yy.context[left.name] = right;
};

yy.Variable = function Variable(name) {
  this.type = 'variable';
  this.name = name;
  this.indices = [];
};

yy.KeywordAction = function KeywordAction(keyword, expression) {
  this.keyword = keyword;
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
}

yy.resolveVar = function resolveVar(expression) {
  if (expression.type === 'variable') {
    return yy.context[expression.name];
  }
  return expression;
}

// yy.Operation = function Operation(type) {
//   this.type = type;
//   switch (type) {
//     case '+':
//     case '-':
//     case '*':
//     case '/':
//     case '^':
//       var left = arguments[1];
//       var right = arguments[2];
//       if (left.type === 'variable') {
//         left = 
//       }
//   }
// }

module.exports = parser;
