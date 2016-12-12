module.exports = SunCompiler;

var readlineSync = require('readline-sync');
var parser = require('./parser');
var operations = require('./operations');
var OPERATIONS_BY_OPERANDS = operations.OPERATIONS_BY_OPERANDS;
var OPERATIONS_BY_TYPE = operations.OPERATIONS_BY_TYPE;
var OPERATION_EXECUTIONS = operations.OPERATION_EXECUTIONS;


function executeOperation(type, a, b) {

  if (OPERATIONS_BY_TYPE['number'].indexOf(-1) === -1) {
    if (typeof a !== 'number') {
      throw new Error("'"+a+"' is not a number");
    }
    if (b !== undefined && typeof b !== 'number') {
      throw new Error("'"+b+"' is not a number");
    }

    if (type === 'division' && b === 0) {
      throw new Error('Division by zero encountered');
    }
  }

  // one operand
  if (b === undefined) {
    return OPERATION_EXECUTIONS[type](a);
  }
  // two operands
  else {
    return OPERATION_EXECUTIONS[type](a, b);
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

SunCompiler.prototype.executeEnter = function executeEnter(node) {
  if (node.type !== 'variable') {
    var result = this.parseNode(node);
    throw new Error("Enter must be used with variables, found: "+result+"'");
  }
  var varName = node.name;
  var answer = readlineSync.question('');
  var val = parseFloat(answer);
  val = isNaN(val) ? answer : val;
  this.context[varName] = val;
}

SunCompiler.prototype.parseNode = function parseNode(node) {
  if (typeof node === 'object') {

    var type = node.type;

    if (type === 'variable') {

      var varName = node.name
      var val = this.context[varName];
      if (val === undefined) {
        throw new Error("First usage of variable '"+varName+"', declare the variable above this line first.");
      }
      return this.context[varName];

    } else if (type === 'keyword') {

      if (node.keyword === 'Print') {
        var val = parseNode.call(this, node.expression);
        console.log(val);
      } else if (node.keyword === 'Enter') {
        this.executeEnter(node.expression);
      } else {
        throw new Error("Unrecognized keyword: '"+node.keyword+"'");
      }

    } else if (type === 'assignment') {

      var variable = node.left;
      this.context[variable.name] = parseNode.call(this, node.right);
      return undefined;

    } else if (type === 'if_else') {

      var condition = parseNode.call(this, node.condition);
      var block = condition ? node.ifBlock : node.elseBlock;

      for (var i=0; i < block.length; i++) {
        parseNode.call(this, block[i]);
      }

    } else if (OPERATIONS_BY_OPERANDS[1].indexOf(type) !== -1) {

      var operand = parseNode.call(this, node.operand);
      return executeOperation(node.type, node.operand);
      
    } else if (OPERATIONS_BY_OPERANDS[2].indexOf(type) !== -1) {

      var left = parseNode.call(this, node.left);
      var right = parseNode.call(this, node.right);
      return executeOperation(node.type, left, right);

    } else {

      throw new Error("Unhandled node type: '"+node.type+"'");

    }

  } else {
    // expression base, STRING, INT, FLOAT
    return node;
  }
}

