var grammar = require('./grammar');
var Parser = require('jison').Parser;
var nodes = require('./nodes');
var parser = new Parser(grammar);
var yy = parser.yy;

for (var prop in nodes) {
  yy[prop] = nodes[prop];
}

// yy.Operation = nodes.Operation;
// yy.KeywordAction = nodes.KeywordAction;
// yy.Variable = nodes.Variable;
// yy.IfElseStmt = nodes.IfElseStmt;
// yy.LoopStmt = nodes.LoopStmt;

yy._iemitstack = [0]; // indentation stack that starts with 0

module.exports = parser;
