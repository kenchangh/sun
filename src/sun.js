var readlineSync = require('readline-sync');
var parser = require('./parser');
var operations = require('./operations');
var OPERATIONS_BY_OPERANDS = operations.OPERATIONS_BY_OPERANDS;
var OPERATIONS_BY_TYPE = operations.OPERATIONS_BY_TYPE;
var OPERATION_EXECUTIONS = operations.OPERATION_EXECUTIONS;
var checkIsBrowser = new Function("try {return this===window;}catch(e){ return false;}");
var isBrowser = checkIsBrowser();

// if path never taken in tests
/* istanbul ignore if */
if (isBrowser) {
  // mock readlineSync
  /* istanbul ignore next */
  readlineSync = {
    question: function() {},
  };
}

/* istanbul ignore next */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

function executeOperation(type, a, b) {

  if (OPERATIONS_BY_TYPE['number'].indexOf(type) !== -1) {
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

function SunCompiler(debug) {
  // expose the context to public for testing
  this.debug = debug;
  this.context = {};
  this.functions = {};
  this.outputBuffer = [];
  this.reset = function reset() {
    this.context = {};
    this.functions = {};
    this.outputBuffer = [];
  };
  this.setPrintHook = function setPrintHook(cb) {
    this.printHook = cb;
  }
  this.setEnterHook = function setEnterHook(cb) {
    this.enterHook = cb;
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

    // reorder so that parse all the function nodes first
    var functions = parseTree.filter(function(node) {
      return node.type === 'function';
    });
    var otherNodes = parseTree.filter(function(node) {
      return node.type !== 'function';
    });
    parseTree = functions.concat(otherNodes);
    this.parseBlock(parseTree);

  } catch (e) {

    /* istanbul ignore next */
    if (this.debug) {
      throw e;
    }
    /* istanbul ignore next */
    this.executePrint(e.message);

  } finally {

    if (!this.debug) {
      this.reset();
    }

  }

}

/* istanbul ignore next */
/* ignoring Enter as have to test manually */
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
  // this.context[varName] = val;
  // console.log(node);
  this.setVariable(node, val);
}

/* istanbul ignore next */
/* ignoring Print as have to test manually */
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

function throwIfNonIntIndices(indices) {
  for (var i = 0; i < indices.length; i++) {
    var index = indices[i];
    if (typeof index !== 'number' || isFloat(index)) {
      throw new Error("Array index should be integers, found '"+index+"'");
    }
  }
}

SunCompiler.prototype.getVariable = function getVariable(variable) {
  var varName = variable.name;
  var val = this.context[varName];
  if (val === undefined) {
    throw new Error("First usage of variable '"+varName+"', declare the variable above this line first.");
  }
  // if (node.indices && typeof val !== 'object') {
  //   throw new Error("Cannot access elements of variable '"+varName+"'. It is not an array, it's a '"+typeof val+"'");
  // }

  var indices = variable.indices;
  if (indices) {
    // apply the indices until the end
    // for (var i = 0; i < indices.length; i++) {
    //   index = indices[i];
    //   val = val[index];
    // }
    indices = indices.map(this.parseNode.bind(this));
    throwIfNonIntIndices(indices);

    var key = indices.toString();
    val = this.context[varName][key];

    if (val === undefined) {
      var elementAccess = indices.map(function(index) {
        return '['+index+']';
      }).join('');
      throw new Error("There's no element at '"+varName+elementAccess+"'");
    }
  } else {
    val = this.context[varName];
  }
  return val;
};

SunCompiler.prototype.setVariable = function setVariable(variable, expression) {
  var indices = variable.indices;
  var varName = variable.name;
  var currentVal = this.context[varName];
  var newVal = this.parseNode.call(this, expression);

  if (currentVal !== undefined &&
    typeof currentVal !== 'object' &&
    Array.isArray(indices)) {
    throw new Error("Cannot assign elements of variable '"+varName+"'. It is not an array, it's a '"+typeof val+"'");
  }
  var currentType = typeof currentVal;
  var newType = typeof newVal;
  if (currentVal !== undefined &&
    typeof currentVal !== 'object' &&
    currentType !== newType) {

    throw new Error("Assigning a '"+
      newType+"' to a '"+currentType+
      "' at variable '"+varName+"'");

  }
  if (Array.isArray(indices)) {
    // arrays represented as objects internally
    // use the indices as hash keys
    // A[0][1][2] becomes A['0,1,2']

    // actually parsing the index expressions
    indices = indices.map(this.parseNode.bind(this));
    throwIfNonIntIndices(indices);

    /* istanbul ignore else */
    if (this.context[varName] === undefined) {
      this.context[varName] = {};
    }
    var key = indices.toString();
    this.context[varName][key] = newVal;

  } else {
    this.context[varName] = newVal;
  }
};

SunCompiler.prototype.parseNode = function parseNode(node) {

  if (typeof node === 'object' && node !== null) {

    var type = node.type;

    if (type === 'variable') {

      var val = this.getVariable(node);
      return val;

    } else if (type === 'keyword') {

      /* istanbul ignore else */
      if (node.keyword === 'Print') {
        var val = parseNode.call(this, node.expression);
        this.executePrint(val);
      } else if (node.keyword === 'Enter') {
        /* istanbul ignore next */
        // ignoring coverage, manually test
        this.executeEnter(node.expression);
      }

    } else if (type === 'assignment') {

      var variable = node.left;
      var val = parseNode.call(this, node.right);
      this.setVariable(variable, val);
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

    } else if (type === 'function') {

      // just storing for future calls
      this.functions[node.name] = node;
      return undefined;

    } else if (OPERATIONS_BY_OPERANDS[1].indexOf(type) !== -1) {

      var operand = parseNode.call(this, node.operand);
      return executeOperation(node.type, operand);

    } else if (OPERATIONS_BY_OPERANDS[2].indexOf(type) !== -1) {

      var left = parseNode.call(this, node.left);
      var right = parseNode.call(this, node.right);
      return executeOperation(node.type, left, right);

    } else {

      throw new Error("Unhandled node type: '"+node.type+"'");

    }

  } else if (node !== null && node !== undefined) {
    // expression base, STRING, INT, FLOAT, BOOL
    return node;
  } else {
    throw new Error("Invalid node: '"+node+"'");
  }
}

module.exports = SunCompiler;
