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
  this.keyword = keyword;
  this.expression = expression;
}

function IfElseStmt(condition, ifBlock, elseBlock) {
  this.condition = condition;
  this.ifBlock = ifBlock;
  this.elseBlock = elseBlock;
}

function Operation(type, left, right) {
  this.type = type;
  switch (type) {
    case 'assignment':
    case 'addition':
    case 'substraction':
    case 'multiplication':
    case 'division':
    case 'exponentiation':
      this.left = left;
      this.right = right;
      break;
    default:
      break;
  }
}
