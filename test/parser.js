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
  new nodes.Operation('assignment', new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('x = 1\n'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('y = (5-1)*5/6+7'), [
  {
    "left": new nodes.Variable('y'),
    "right": {
      "left": {
        "left": {
          "left": {
            "left": 5,
            "right": 1,
            "type": "subtraction"
          },
          "right": 5,
          "type": "multiplication"
        },
        "right": 6,
        "type": "division"
      },
      "right": 7,
      "type": "addition"
    },
    type: 'assignment',
  },
]);

tap.same(parser.parse('x = 1\ny = (5-1)*5/6+7'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 1),
  {
    "left": new nodes.Variable('y'),
    "right": {
      "left": {   
        "left": {
          "left": {
            "left": 5,
            "right": 1,
            "type": "subtraction"
          },
          "right": 5,
          "type": "multiplication"
        },
        "right": 6,
        "type": "division"
      },
      "right": 7,
      "type": "addition"
    },
    type: 'assignment',
  },
]);

tap.same(parser.parse('x = 1\ny = x + 2'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 1),
  new nodes.Operation('assignment',
    new nodes.Variable('y'),
    new nodes.Operation('addition',
      new nodes.Variable('x'), 2)
  ),
]);

tap.same(parser.parse('x = 3\ny = x^x + 2\ny = y + 2'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 3),
  new nodes.Operation('assignment',
    new nodes.Variable('y'),
    new nodes.Operation('addition',
      new nodes.Operation('exponentiation',
        new nodes.Variable('x'),
        new nodes.Variable('x')
      ),
      2
    )
  ),
  new nodes.Operation('assignment',
    new nodes.Variable('y'),
    new nodes.Operation('addition', new nodes.Variable('y'), 2)
  ),
]);

tap.same(parser.parse("x = 'a'"), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 'a'),
]);

tap.same(parser.parse('x = "a"'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 'a'),
]);

tap.same(parser.parse('x = "\'a\'"'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), "'a'"),
]);

tap.same(parser.parse('Print "hello world"'), [
  new nodes.KeywordAction('Print', 'hello world'),
]);


tap.same(parser.parse('x = 3\nPrint x'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 3),
  new nodes.KeywordAction('Print', new nodes.Variable('x')),
]);

tap.same(parser.parse('Print (5-1)*5/6+7'), [
  new nodes.KeywordAction('Print', {
    "left": {
      "left": {
        "left": {
          "left": 5,
          "right": 1,
          "type": "subtraction"
        },
        "right": 5,
        "type": "multiplication"
      },
      "right": 6,
      "type": "division"
    },
    "right": 7,
    "type": "addition"
  }),
]);

// Avoid testing Enter, slows down test cycle
// tap.same(parser.parse('Enter x\nPrint x'), [
//   new nodes.KeywordAction('Enter', new nodes.Variable('x')),
//   new nodes.KeywordAction('Print', new nodes.Variable('x')),
// ]);

var ifElseStr;

ifElseStr = `If 1 Then
  Print 1
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt(1, [
    new nodes.KeywordAction('Print', 1),
  ], null),
]);

ifElseStr = `If 1 Then
  Print 1
  Print 2
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt(1, [
    new nodes.KeywordAction('Print', 1),
    new nodes.KeywordAction('Print', 2),
  ], null),
]);

ifElseStr = `If 1 Then
  Print 1
  Print 2
Else
  Print 3
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt(1, [
    new nodes.KeywordAction('Print', 1),
    new nodes.KeywordAction('Print', 2),
  ], [
    new nodes.KeywordAction('Print', 3),
  ]),
]);
