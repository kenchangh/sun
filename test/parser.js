var tap = require('tap');
var parser = require('../parser');
var nodes = require('../nodes');

// tap.same(parser.parse('1 + 1'), [2]);
// tap.same(parser.parse('1 + 1\n'), [2]);
// tap.same(parser.parse('2 / 1'), [2]);

// tap.same(parser.parse('5/-1'), [-5]);

// tap.same(parser.parse('(5-1)*5/6+7'), [10.333333333333334]);
// tap.same(parser.parse('(5*(5+5))'), [50]);
// tap.same(parser.parse('5^5 * 5'), [15625]);
// tap.same(parser.parse('-(5^5 * 5)'), [-15625]);

tap.same(parser.parse('x = 1'), [
  new nodes.Assignment(new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('x = 1\n'), [
  new nodes.Assignment(new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('y = (5-1)*5/6+7'), [
  new nodes.Assignment(new nodes.Variable('y'), 10.333333333333334)
]);

tap.same(parser.parse('x = 1\ny = (5-1)*5/6+7'), [
  new nodes.Assignment(new nodes.Variable('x'), 1),
  new nodes.Assignment(new nodes.Variable('y'), 10.333333333333334),
]);

tap.same(parser.parse('x = 1\ny = x + 2'), [
  new nodes.Assignment(new nodes.Variable('x'), 1),
  new nodes.Assignment(new nodes.Variable('y'), 3),
]);

tap.same(parser.parse('x = 3\ny = x^x + 2\ny = y + 2'), [
  new nodes.Assignment(new nodes.Variable('x'), 3),
  new nodes.Assignment(new nodes.Variable('y'), 29),
  new nodes.Assignment(new nodes.Variable('y'), 31),
]);

tap.same(parser.parse("x = 'a'"), [
  new nodes.Assignment(new nodes.Variable('x'), 'a'),
]);

tap.same(parser.parse('x = "a"'), [
  new nodes.Assignment(new nodes.Variable('x'), 'a'),
]);

tap.same(parser.parse('x = "\'a\'"'), [
  new nodes.Assignment(new nodes.Variable('x'), "'a'"),
]);

tap.same(parser.parse('Print "hello world"'), [
  new nodes.KeywordAction('Print', 'hello world'),
]);


tap.same(parser.parse('x = 3\nPrint x'), [
  new nodes.Assignment(new nodes.Variable('x'), 3),
  new nodes.KeywordAction('Print', new nodes.Variable('x')),
]);

tap.same(parser.parse('Print (5-1)*5/6+7'), [
  new nodes.KeywordAction('Print', 10.333333333333334),
]);

// Avoid testing Enter, slows down test cycle
// tap.same(parser.parse('Enter x\nPrint x'), [
//   new nodes.KeywordAction('Enter', new nodes.Variable('x')),
//   new nodes.KeywordAction('Print', new nodes.Variable('x')),
// ]);
