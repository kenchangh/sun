var fs = require('fs');
var path = require('path');
var debugPerf = require('debug')('perf');
var debugTotalPerf = require('debug')('perf-total');

var readlineSync = require('readline-sync');
var utils = require('./utils');
var boolToString = utils.boolToString;
var indicesToKey = utils.indicesToKey;
var flattenObject = utils.flattenObject;
var parser = require('./parser');
var operations = require('./operations');
var nativeFunctions = require('./native-functions.js');

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

function executeOperation(type, a, b) {

  if (OPERATIONS_BY_TYPE['number'].indexOf(type) !== -1) {

    if (type === 'addition') {
      if (typeof a === 'number' && typeof b !== 'number') {
        throw new Error("Cannot add '"+a+"'"+" with '"+b+"'");
      }
      if (typeof a === 'string' && typeof b !== 'string') {
        throw new Error("Cannot concatenate '"+a+"'"+" with '"+b+"'");
      }
    } else {
      if (typeof a !== 'number') {
        throw new Error("'"+a+"' is not a number");
      }
      if (b !== undefined && typeof b !== 'number') {
        throw new Error("'"+b+"' is not a number");
      }
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

function SunCompiler(options) {
  options = options || {};

  this.debug = options.debug || false;
  this.bootstrap = options.bootstrap || false;
  this.returns = {};
  this.contexts = {};
  this.callCounts = {};
  this.functions = {};
  this.references = [];
  this.referenceDict = [];
  this.outputBuffer = [];
  this.targetSrc = null;

  // loading all the nativeFunctions
  this.nativeFunctions = {};
  for (var func in nativeFunctions) {
    this.nativeFunctions[func] = nativeFunctions[func];
  }

  if (this.bootstrap) {
    this._bootstrapSun();
  }

  this.reset = function reset() {
    this.returns = {};
    this.contexts = {};
    this.callCounts = {};
    this.functions = {};
    this.references = [];
    this.referenceDict = [];
    this.outputBuffer = [];
    this.targetSrc = null;
  };
  this.setPrintHook = function setPrintHook(cb) {
    this.printHook = cb;
  }
  this.setEnterHook = function setEnterHook(cb) {
    this.enterHook = cb;
  }
}

SunCompiler.prototype.createContext = function createContext(name, declParams, callParams) {
  var funcName = name;

  if (callParams.length !== declParams.length) {
    throw new Error("Function '"+name+"' requires "+
      declParams.length+" arguments but called with "+
      callParams.length+" arguments");
  }

  if (name !== 'global') {
    this.callCounts[name] = Number.isInteger(this.callCounts[name])
      ? this.callCounts[name] + 1 : 0;
    name = name + '.' + this.callCounts[name];
  }

  var variables = {};
  var isReference;
  for (var i = 0; i < declParams.length; i++) {
    // dont load the context with variable if isReference
    isReference = this.references[funcName][i];
    if (!isReference) {
      variables[declParams[i].name] = callParams[i];
    }
  }
  this.contexts[name] = variables;

  // return value will be be stored here
  this.returns[name] = null;

  this.referenceDict[name] = [];

  return name;
};

SunCompiler.prototype.parseBlock = function parseBlock(context, block) {
  for (var i=0; i < block.length; i++) {
    this.parseNode(context, block[i]);

    // traverse upwards to parent node
    if (this.returns[context]) {
      return undefined;
    }
  }
}

SunCompiler.prototype._bootstrapSun = function _bootstrapSun(src) {
  var filepath = path.join(__dirname, 'sun.sun');
  var compilerSrcBuf = fs.readFileSync(filepath);
  var compilerSrc = compilerSrcBuf.toString();
  this.bootstrapCompilerSrc = compilerSrc;
};

SunCompiler.prototype.compile = function compile(src) {
  if (this.bootstrap && !this.targetSrc) {
    // stored for later usage, in case NotImplementedError happens
    this.targetSrc = src;
    var compilerSrc = this.bootstrapCompilerSrc;
    compilerSrc = compilerSrc.replace(/\$SOURCE_CODE/, utils.escapeSource(src));
    this._compile(compilerSrc);
  } else {
    this.targetSrc = null;
    this._compile(src);
  }
};

SunCompiler.prototype._compile = function _compile(src) {
  try {
    debugTotalPerf('Compiling source...');
    debugPerf('Creating parse tree...');
    var parseTree = parser.parse(src);
    debugPerf('Created parse tree');

    debugPerf('Executing parse tree...');
    // reorder so that parse all the function nodes first
    var functions = parseTree.filter(function(node) {
      return node.type === 'function';
    });
    var otherNodes = parseTree.filter(function(node) {
      return node.type !== 'function';
    });
    var mainFunction = parseTree.find(function(node) {
      return node.type === 'main_function';
    });

    if (mainFunction && otherNodes.length > 1) {
      throw new Error('Statements cannot be outside Start and End');
    }

    parseTree = functions.concat(otherNodes);

    var context = this.createContext('global', [], []);
    this.parseBlock(context, parseTree);

    debugPerf('Executed parse tree');
    debugTotalPerf('Compiling source...');

  } catch (e) {

    if (e.name === 'NotImplementedError' && this.bootstrap) {
      var targetSrc = this.targetSrc;
      this.targetSrc = null;
      this._compile(targetSrc);
      return;
      // console.log(e.message)
    } else {
      throw e;
    }

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
SunCompiler.prototype.executeEnter = function executeEnter(context, node) {
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
  this.setVariable(context, node, val);
}

/* istanbul ignore next */
/* ignoring Print as have to test manually */
SunCompiler.prototype.executePrint = function executePrint(val) {

  // map to uppercased booleans for consistency
  if (typeof val === 'boolean') {
    val = val ? 'True' : 'False';
  }

  if (this.debug) {

    this.outputBuffer.push(val);

  } else if (isBrowser) {
    if (!isFunction(this.printHook)) {
      throw new Error('No browser implementation of Print function');
    }
    this.printHook(val);

  } else {

    process.stdout.write(val.toString());

  }
}

function throwIfIllegalIndices(indices) {
  indices.forEach(function (index) {
    if (typeof index === 'object') {
      throw new Error("Array index cannot be an array");
    }
  });
}

SunCompiler.prototype.resolveReference = function resolveReference(context, varName) {
  // returns tuple of [context, varName]
  if (context !== 'global') {
    var funcName = context.split('.')[0];
    var paramNames = this.functions[funcName].params.map(function(param) {
      return param.name;
    });
    var argPosition = paramNames.indexOf(varName);
    var globalVarName = this.referenceDict[context][argPosition];
    if (globalVarName) {
      context = 'global';
      varName = globalVarName;
    }
  }
  return [context, varName];
};

SunCompiler.prototype.getVariable = function getVariable(context, variable) {

  var varName = variable.name;
  var contextVarNameTuple = this.resolveReference(context, varName);
  context = contextVarNameTuple[0];
  varName = contextVarNameTuple[1];

  var scope = this.contexts[context];
  var val = scope[varName];
  if (val === undefined) {
    throw new Error("First usage of variable '"+varName+"', declare the variable above this line first.");
  }

  var indices = variable.indices;
  if (indices) {
    indices = indices.map(function (index) {
      return this.parseNode(context, index);
    }.bind(this));
    throwIfIllegalIndices(indices);

    var queryKey = indicesToKey(indices);
    val = scope[varName][queryKey];
    var arrayKeys = Object.keys(scope[varName]);
    var subArrayKeys = arrayKeys.filter(function(key) {
      return (queryKey + '|') === key.substr(0, queryKey.length+1);
    });

    if (val === undefined && !subArrayKeys.length) {
      var elementAccess = indices.map(function(index) {
        /* istanbul ignore if */
        if (typeof index === 'boolean') {
          /* istanbul ignore next */
          index = boolToString(index);
        }
        return '['+index+']';
      }).join('');
      throw new Error("There's no element at '"+varName+elementAccess+"'");

    } else if (subArrayKeys.length) {
      var subArrayValues = subArrayKeys.map(function(key) {
        return scope[varName][key];
      });
      subArrayKeys = subArrayKeys.map(function(key) {
        return key.substr(queryKey.length+1);
      });
      var newArray = {};
      subArrayKeys.forEach(function(key, index) {
        newArray[key] = subArrayValues[index];
      });
      console.log(indices, newArray)
      return newArray;
    }
  } else {
    val = scope[varName];
  }
  return val;
};

SunCompiler.prototype.setVariable = function setVariable(context, variable, expression) {

  var varName = variable.name;
  var contextVarNameTuple = this.resolveReference(context, varName);
  context = contextVarNameTuple[0];
  varName = contextVarNameTuple[1];

  var scope = this.contexts[context];
  var indices = variable.indices;
  var currentVal = scope[varName];
  var newVal = this.parseNode(context, expression);

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
    indices = indices.map(function(index) {
      return this.parseNode(context, index);
    }.bind(this));
    throwIfIllegalIndices(indices);

    /* istanbul ignore else */
    if (scope[varName] === undefined) {
      this.contexts[context][varName] = {};
    }
    var key = indicesToKey(indices);
    this.contexts[context][varName][key] = newVal;

  } else {
    this.contexts[context][varName] = newVal;
  }
};

SunCompiler.prototype.parseNode = function parseNode(context, node) {

  if (typeof node === 'object' &&
    !Array.isArray(node) &&
    node !== null) {

    var type = node.type;

    if (type === 'variable') {

      var val = this.getVariable(context, node);
      return val;

    } else if (type === 'keyword') {

      /* istanbul ignore else */
      if (node.keyword === 'Print') {

        var values = node.expression.map(function(val) {
          return this.parseNode(context, val);
        }.bind(this));

        var val;
        for (var i = 0; i < values.length; i++) {
          // unescape newlines
          val = values[i];
          if (typeof val === 'string') {
            val = val.replace(/\\n/g, '\n');
          }
          this.executePrint(val);
        }

      } else if (node.keyword === 'Enter') {

        /* istanbul ignore next */
        // ignoring coverage, manually test
        this.executeEnter(context, node.expression);

      } else if (node.keyword === 'Return') {

        if (context === 'global') {
          throw new Error('Return is illegal in the main function');
        }
        var returnVal = this.parseNode(context, node.expression);
        this.returns[context] = returnVal;

      } else if (node.keyword === 'Error') {

        throw new Error(this.parseNode(context, node.expression));

      }

    } else if (type === 'assignment') {

      var variable = node.left;
      var val = this.parseNode(context, node.right);
      this.setVariable(context, variable, val);
      return undefined;

    } else if (type === 'if_else') {

      for (var i = 0; i < node.conditionBlocks.length; i++) {
        var conditionBlock = node.conditionBlocks[i];
        var condition = this.parseNode(context, conditionBlock.condition);

        if (condition) {
          this.parseBlock(context, conditionBlock.block);
          return undefined;
        }
      }
      this.parseBlock(context, node.elseBlock);

    } else if (type === 'switch') {

      var caseOf = this.parseNode(context, node.caseOf);

      for (var i = 0; i < node.caseBlocks.length; i++) {
        var caseBlock = node.caseBlocks[i];
        if (caseOf == caseBlock.condition) {
          this.parseBlock(context, caseBlock.block);
          return undefined;
        }
      }
      this.parseBlock(context, node.otherwiseBlock);

    } else if (type === 'loop') {

      var varName = node.variable.name;
      var start = this.parseNode(context, node.start);
      var stop = this.parseNode(context, node.stop);
      var block = node.block;

      if (typeof start !== 'number') {
        throw new Error("Loop's start must be a number, found: "+typeof start+"'");
      }
      if (typeof stop !== 'number') {
        throw new Error("Loop's stop must be a number, found: "+typeof start+"'");
      }

      this.setVariable(context, node.variable, start);

      for (this.contexts[context][varName];
        this.contexts[context][varName] <= stop;
        this.contexts[context][varName]++) {
        this.parseBlock(context, block);
      }

    } else if (type === 'while') {

      var condition = node.condition;
      var block = node.block;

      while (this.parseNode(context, condition)) {
        this.parseBlock(context, block);
      }

    } else if (type === 'main_function') {

      if (context !== 'global') {
        throw new Error('Cannot create main function in another function');
      }
      var block = node.block;
      this.parseBlock('global', block);

    } else if (type === 'function') {

      var funcName = node.name;

      if (context !== 'global') {
        throw new Error("Unable to nest function '" +
          funcName + "' in " + "'" + context.split('.')[0] + "'" +
          ', declare your functions on the global scope');
      }

      // bit field of references
      var references = node.params.map(function(param) {
        return param.reference;
      });
      this.references[funcName] = references;

      // just storing for future calls
      this.functions[funcName] = node;
      return undefined;

    } else if (type === 'function_call') {

      var funcName = node.name;
      var func = this.functions[funcName];
      var nativeFunc = this.nativeFunctions[funcName];

      if (func === undefined && nativeFunc === undefined) {
        throw new Error("Function '"+funcName+"' is not declared");
      }

      this.referenceDict[context] = [];

      var callParams = node.params.map(function (param, index) {
        return this.parseNode(context, param);
      }.bind(this));

      // actual native JS function, run it instead
      if (isFunction(nativeFunc)) {
        var output = nativeFunc.apply(this, [context].concat(callParams));
        return output;
      }
      var block = func.block;
      var context = this.createContext(funcName, func.params, callParams);

      node.params.forEach(function (param, index) {
        // store reference if pointer
        if (param.type === 'variable' && this.references[funcName][index]) {
          this.referenceDict[context][index] = param.name;
        } else {
          this.referenceDict[context][index] = null;
        }
      }.bind(this));

      this.parseBlock(context, block);
      return this.returns[context];

    } else if (type === 'native') {

      return node.object;

    } else if (OPERATIONS_BY_OPERANDS[1].indexOf(type) !== -1) {

      var operand = this.parseNode(context, node.operand);
      return executeOperation(node.type, operand);

    } else if (OPERATIONS_BY_OPERANDS[2].indexOf(type) !== -1) {

      var left = this.parseNode(context, node.left);
      var right = this.parseNode(context, node.right);
      return executeOperation(node.type, left, right);

    } else {

      throw new Error("Unhandled node: "+JSON.stringify(node));

    }

  } else if (Array.isArray(node)) {

    throw new Error("Expecting node, not node list: "+
      JSON.stringify(node));

  } else if (node !== null && node !== undefined) {
    // expression base, STRING, INT, FLOAT, BOOL
    return node;
  } else {
    throw new Error("Invalid node: "+node);
  }
}

module.exports = SunCompiler;
