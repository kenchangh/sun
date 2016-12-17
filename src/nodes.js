var OPERATIONS_BY_OPERANDS = require('./operations').OPERATIONS_BY_OPERANDS;

var exports = module.exports;

exports.Variable = function Variable(name, indices) {
  this.type = 'variable';
  this.name = name;
  if (indices === undefined) {
    indices = null;
  }
  this.indices = indices;
};

exports.KeywordAction = function KeywordAction(keyword, expression) {
  this.type = 'keyword';
  this.keyword = keyword;
  this.expression = expression;
};

exports.IfElseStmt = function IfElseStmt(condition, ifBlock, elseBlock) {
  this.type = 'if_else'
  this.condition = condition;
  this.ifBlock = ifBlock;

  if (!elseBlock) {
    elseBlock = [];
  }
  this.elseBlock = elseBlock;
};

exports.LoopStmt = function LoopStmt(loopStartVar, loopEndVar, start, stop, block) {
  this.type = 'loop';

  if (loopStartVar.name !== loopEndVar.name) {
    throw new Error('Variable used at end of loop must be same as start of loop. Expected: '
      +loopStartVar.name+'. Found: '+loopEndVar.name);
  }

  this.variable = loopStartVar;
  this.start = start;
  this.stop = stop;
  this.block = block;
};

exports.WhileStmt = function WhileStmt(condition, block) {
  this.type = 'while';
  this.condition = condition;
  this.block = block;
};

exports.FunctionStmt = function FunctionStmt(name, params, block) {
  this.type = 'function';
  this.name = name;
  this.params = params;
  this.block = block;
};

exports.FunctionParam = function FunctionParam(name) {
  this.type = 'function_param';
  this.name = name;
  this.reference = false;
};

exports.FunctionCall = function FuncionCall(name, params) {
  this.type = 'function_call';
  this.params = params;
};

exports.Operation = function Operation(type) {
  this.type = type;

  if (OPERATIONS_BY_OPERANDS[1].indexOf(type) !== -1) {

    this.operand = arguments[1];

  } else if (OPERATIONS_BY_OPERANDS[2].indexOf(type) !== -1) {

    this.left = arguments[1];
    this.right = arguments[2];

  } else if (type === 'assignment') {

    this.left = arguments[1];
    this.right = arguments[2];

  } else {
    throw new Error("Unhandled node type: '"+type+"'");
  }
};
