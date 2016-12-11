var readline = require('readline');
var grammar = require('./grammar');
var Parser = require('jison').Parser;


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

yy.KeywordAction = function KeywordAction(keyword, variable) {
  this.keyword = keyword;
  switch (keyword) {
    case 'Print':
      console.log(yy.resolveVar(variable));
      break;
    case 'Enter':
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('prompt: ', function (answer) {
        console.log(typeof answer);
        var val = parseFloat(answer, 10);
        if (val === NaN) val = answer;
        new yy.Assignment(new yy.Variable(variable), val);
        rl.close();
      });
      break;
    default:
      break;
  }
}

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
