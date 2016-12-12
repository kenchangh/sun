module.exports = {
  Assignment: Assignment,
  Variable: Variable,
  KeywordAction: KeywordAction,
};

function Assignment(left, right) {
  this.type = 'assignment';
  this.left = left; // variable
  this.right = right; // expression
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
