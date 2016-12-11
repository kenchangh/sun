var tap = require('tap');
var parser = require('../parser');

function Assignment(left, right) {
  this.type = 'assignment';
  this.left = left;
  this.right = right;
  return this;
}

function Variable(name) {
  this.type = 'variable';
  this.name = name;
  this.indices = [];
  return this;
}

tap.same(parser.parse('1 + 1'), [2]);
tap.same(parser.parse('2 / 1'), [2]);

tap.same(parser.parse('5/-1'), [-5]);

tap.same(parser.parse('(5-1)*5/6+7'), [10.333333333333334]);
tap.same(parser.parse('(5*(5+5))'), [50]);
tap.same(parser.parse('5^5 * 5'), [15625]);
tap.same(parser.parse('-(5^5 * 5)'), [-15625]);

tap.same(parser.parse('x = 1'), [
  new Assignment(new Variable('x'), 1)
]);
tap.same(parser.parse('y = (5-1)*5/6+7'), [
  new Assignment(new Variable('y'), 10.333333333333334)
]);
tap.same(parser.parse('x = 1\ny = (5-1)*5/6+7'), [
  new Assignment(new Variable('x'), 1),
  new Assignment(new Variable('y'), 10.333333333333334),
]);
