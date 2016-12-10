var tap = require('tap');
var parser = require('../parser');

tap.equals(parser.parse('1 + 1'), 2);
tap.equals(parser.parse('2 / 1'), 2);

tap.equals(parser.parse('5/-1'), -5);

tap.equals(parser.parse('(5-1)*5/6+7'), 10.333333333333334);
tap.equals(parser.parse('(5*(5+5))'), 50);
tap.equals(parser.parse('5^5 * 5'), 15625);
tap.equals(parser.parse('-(5^5 * 5)'), -15625);

tap.equals(parser.parse('x = 1'), 1);
tap.equals(parser.parse('y = (5-1)*5/6+7'), 10.333333333333334);
