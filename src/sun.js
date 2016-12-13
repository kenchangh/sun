var readlineSync = require('readline-sync');
var parser = require('./parser');
var operations = require('./operations');
var OPERATIONS_BY_OPERANDS = operations.OPERATIONS_BY_OPERANDS;
var OPERATIONS_BY_TYPE = operations.OPERATIONS_BY_TYPE;
var OPERATION_EXECUTIONS = operations.OPERATION_EXECUTIONS;
var checkIsBrowser = new Function("try {return this===window;}catch(e){ return false;}");
var isBrowser = checkIsBrowser();

if (isBrowser) {
  // mock readlineSync
  readlineSync = {
    question: function() {},
  };
}

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function executeOperation(type, a, b) {

  if (OPERATIONS_BY_TYPE['number'].indexOf(type) !== -1) {
    if (typeof a !== 'number') {
      console.log(type, a, b)
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

function SunCompiler(debug) {
  // expose the context to public for testing
  this.debug = debug;
  this.context = {};
  this.outputBuffer = [];
  this.reset = function reset() {
    this.context = {};
    this.outputBuffer = [];
  };
  this.setPrintHook = function setPrintHook(cb) {
    this.printHook = cb;
  }
  this.setEnterHook = function setEnterHook(cb) {
    this.enterHook = cb;
  }
  this.onParseTreeReady = function onParseTreeReady(cb) {
    this.handleParseTreeReady = cb;
  }
}

SunCompiler.prototype.parseBlock = function parseBlock(block) {
  for (var i=0; i < block.length; i++) {
    this.parseNode.call(this, block[i]);
  }
}

SunCompiler.prototype.compile = function compile(source) {
  try {
    var parseTree = parser.parse(source);
    this.parseBlock(parseTree);

    if (isFunction(this.handleParseTreeReady)) {
      this.handleParseTreeReady(parseTree);
    }

    
  } catch (e) {

    if (this.debug) {
      throw e;
    }
    this.executePrint(e.message);

  } finally {

    if (!this.debug) {
      this.reset();
    }

  }
  
}

SunCompiler.prototype.executeEnter = function executeEnter(node) {
  if (node.type !== 'variable') {
    throw new Error("Enter must be used with variables, found: "+node.type+"'");
  }
  var varName = node.name;

  var answer;
  if (isBrowser) {
    if (!isFunction(this.enterHook)) {
      throw new Error('No browser implementation of Enter function');
    }
    answer = this.enterHook(varName);
  } else {
    answer = readlineSync.question('');
  }
  var val = parseFloat(answer);
  val = isNaN(val) ? answer : val;
  this.context[varName] = val;
}

SunCompiler.prototype.executePrint = function executePrint(val) {
  if (this.debug) {

    this.outputBuffer.push(val);

  } else if (isBrowser) {
    if (!isFunction(this.printHook)) {
      throw new Error('No browser implementation of Print function');
    }
    this.printHook(val);

  } else {

    console.log(val);

  }
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
        this.executePrint(val);
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
      this.parseBlock(block);

    } else if (type === 'loop') {

      var varName = node.variable.name;
      var start = parseNode.call(this, node.start);
      var stop = parseNode.call(this, node.stop);
      var block = node.block;

      if (typeof start !== 'number') {
        throw new Error("Loop's start must be a number, found: "+typeof start+"'");
      }
      if (typeof stop !== 'number') {
        throw new Error("Loop's stop must be a number, found: "+typeof start+"'");
      }

      this.context[varName] = start;
      for (this.context[varName]; this.context[varName] <= stop; this.context[varName]++) {
        this.parseBlock(block);
      }

    } else if (type === 'while') {

      var condition = node.condition;
      var block = node.block;

      while (parseNode.call(this, condition)) {
        this.parseBlock(block);
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
    // expression base, STRING, INT, FLOAT, BOOL
    return node;
  }
}

module.exports = SunCompiler;
