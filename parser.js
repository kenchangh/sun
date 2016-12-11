var readline = require('readline');
var grammar = require('./grammar');
var Parser = require('jison').Parser;
// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

var parser = new Parser(grammar);
var yy = parser.yy;

yy.scope = {};

yy.Assignment = function Assignment(left, right) {
  this.type = 'assignment';
  this.left = left; // variable
  this.right = right; // expression
  yy.scope[left.name] = right;
};

yy.Variable = function Variable(name) {
  this.type = 'variable';
  this.name = name;
  this.indices = [];
};

yy.resolveVar = function resolveVar(expression) {
  if (expression.type === 'variable') {
    return yy.scope[expression.name];
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
