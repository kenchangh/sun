module.exports = SunCompiler;

var parser = require('./parser');

function executeOperation(type, a, b) {
  if (typeof a !== 'number') {
    throw new Error("'"+a+"' is not a number");
  }
  if (typeof b !== 'number') {
    throw new Error("'"+b+"' is not a number");
  }

  if (type === 'division' && b === 0) {
    throw new Error('Division by zero encountered');
  }

  var operations = {
    addition: function () { return a + b },
    subtraction: function () { return a - b },
    multiplication: function () { return a * b },
    division: function () { return a / b },
    exponentiation: function () { return Math.pow(a, b) },
    equal: function () { return a === b },
    inequal: function () { return a !== b },
    conjunction: function () { return a && b },
    disjunction: function () { return a || b },
  };

  return operations[type]();
}

function executeEnter(node) {
  if (node.type !== 'variable') {
    throw new Error('Enter must be used with variables');
  }

}

function SunCompiler() {
  // expose the context to public for testing
  this.context = {};
  this.resetContext = function resetContext() {
    this.context = {};
  };
}

SunCompiler.prototype.compile = function compile(source) {
  var parseTree = parser.parse(source);
  for (var i=0; i < parseTree.length; i++) {
    this.parseNode(parseTree[i]);
  }
}

SunCompiler.prototype.parseNode = function parseNode(node) {
  if (typeof node === 'object') {

    switch (node.type) {
      // resolve variables here
      case 'variable':
        var varName = node.name
        var val = this.context[varName];
        if (val === undefined) {
          throw new Error("First usage of variable '"+varName+"', declare the variable above this line first.");
        }
        return this.context[varName];

      case 'assignment':
        var variable = node.left;
        this.context[variable.name] = parseNode.call(this, node.right);
        break;

      case 'addition':
      case 'subtraction':
      case 'multiplication':
      case 'division':
      case 'exponentiation':
      case 'equal':
      case 'inequal':
      case 'conjunction':
      case 'disjunction':
        var left = parseNode.call(this, node.left);
        var right = parseNode.call(this, node.right);
        if (left === undefined) console.log(node);
        return executeOperation(node.type, left, right);

      case 'keyword':
        if (node.keyword === 'Print') {
          var val = parseNode.call(this, node.expression);
          console.log(val);
        } else if (node.keyword === 'Enter') {
          executeEnter(node.expression);
        }
        break;

      case 'if_else':
        var condition = parseNode.call(this, node.condition);
        var block = condition ? node.ifBlock : node.elseBlock;

        for (var i=0; i < block.length; i++) {
          parseNode.call(this, block[i]);
        }
        break;

      default:
        throw new Error("Unhandled node type: '"+node.type+"'");
        break;
    }

  } else {
    // expression base, STRING, INT, FLOAT
    return node;
  }
}

