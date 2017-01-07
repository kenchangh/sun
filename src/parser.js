var debug = require('debug')('perf');
var grammar = require('./grammar');
var Parser = require('jison').Parser;
var nodes = require('./nodes');

debug('Loading grammar...');
var parser = new Parser(grammar);
debug('Finished loading grammar');
var yy = parser.yy;

var oldParse = parser.parse;
parser.parse = function parse(src) {
  return oldParse.call(parser, src.trim()+'\n');
};

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
