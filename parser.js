var readlineSync = require('readline-sync');
var grammar = require('./grammar');
var Parser = require('jison').Parser;
var nodes = require('./nodes');
var parser = new Parser(grammar);
var yy = parser.yy;

yy.Operation = nodes.Operation;
yy.KeywordAction = nodes.KeywordAction;
yy.Variable = nodes.Variable;
yy.IfElseStmt = nodes.IfElseStmt;

yy._iemitstack = [0]; // indentation stack that starts with 0

module.exports = parser;
