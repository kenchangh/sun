module.exports = {
  Variable: Variable,
  KeywordAction: KeywordAction,
  Operation: Operation,
  IfElseStmt: IfElseStmt,
  LoopStmt: LoopStmt,
  WhileStmt: WhileStmt,
};

var OPERATIONS_BY_OPERANDS = require('./operations').OPERATIONS_BY_OPERANDS;

function Variable(name) {
  this.type = 'variable';
  this.name = name;
  this.indices = [];
};

function KeywordAction(keyword, expression) {
  this.type = 'keyword';
  this.keyword = keyword;
  this.expression = expression;
}

function IfElseStmt(condition, ifBlock, elseBlock) {
  this.type = 'if_else'
  this.condition = condition;
  this.ifBlock = ifBlock;

  if (!elseBlock) {
    elseBlock = [];
  }
  this.elseBlock = elseBlock;
}

function LoopStmt(variable, start, stop, block) {
  this.type = 'loop';
  this.variable = variable;
  this.start = start;
  this.stop = stop;
  this.block = block;
}

function WhileStmt(condition, block) {
  this.type = 'while';
  this.condition = condition;
  this.block = block;
}

function Operation(type) {
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
}
