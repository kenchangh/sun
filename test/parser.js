var tap = require('tap');
var parser = require('../parser');
var obj = require('../objects');

// tap.same(parser.parse('1 + 1'), [2]);
// tap.same(parser.parse('1 + 1\n'), [2]);
// tap.same(parser.parse('2 / 1'), [2]);

// tap.same(parser.parse('5/-1'), [-5]);

// tap.same(parser.parse('(5-1)*5/6+7'), [10.333333333333334]);
// tap.same(parser.parse('(5*(5+5))'), [50]);
// tap.same(parser.parse('5^5 * 5'), [15625]);
// tap.same(parser.parse('-(5^5 * 5)'), [-15625]);

tap.same(parser.parse('x = 1'), [
  new obj.Assignment(new obj.Variable('x'), 1)
]);

tap.same(parser.parse('x = 1\n'), [
  new obj.Assignment(new obj.Variable('x'), 1)
]);

tap.same(parser.parse('y = (5-1)*5/6+7'), [
  new obj.Assignment(new obj.Variable('y'), 10.333333333333334)
]);

tap.same(parser.parse('x = 1\ny = (5-1)*5/6+7'), [
  new obj.Assignment(new obj.Variable('x'), 1),
  new obj.Assignment(new obj.Variable('y'), 10.333333333333334),
]);

tap.same(parser.parse('x = 1\ny = x + 2'), [
  new obj.Assignment(new obj.Variable('x'), 1),
  new obj.Assignment(new obj.Variable('y'), 3),
]);

tap.same(parser.parse('x = 3\ny = x^x + 2\ny = y + 2'), [
  new obj.Assignment(new obj.Variable('x'), 3),
  new obj.Assignment(new obj.Variable('y'), 29),
  new obj.Assignment(new obj.Variable('y'), 31),
]);

tap.same(parser.parse('x = 3\nPrint x'), [
  new obj.Assignment(new obj.Variable('x'), 3),
  new obj.KeywordAction('Print', new obj.Variable('x')),
]);

tap.same(parser.parse('Print (5-1)*5/6+7'), [
  new obj.KeywordAction('Print', 10.333333333333334),
]);

// Avoid testing Enter, slows down test cycle
// tap.same(parser.parse('Enter x\nPrint x'), [
//   new obj.KeywordAction('Enter', new obj.Variable('x')),
//   new obj.KeywordAction('Print', new obj.Variable('x')),
// ]);
