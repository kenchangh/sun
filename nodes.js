module.exports = {
  Variable: Variable,
  KeywordAction: KeywordAction,
  Operation: Operation,
  IfElseStmt: IfElseStmt,
};

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
  this.elseBlock = elseBlock;
}

function Operation(type) {
  this.type = type;
  switch (type) {
    case 'assignment':
    case 'addition':
    case 'subtraction':
    case 'multiplication':
    case 'division':
    case 'exponentiation':
    case 'equal':
    case 'inequal':
    case 'conjunction':
    case 'disjunction':
      this.left = arguments[1];
      this.right = arguments[2];
      break;
    case 'negation':
      this.operand = left;
    default:
      break;
  }
}
