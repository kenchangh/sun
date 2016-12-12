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

tap.same(parser.parse('x = True'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), true)
]);

// distinguishing lower-case true
tap.same(parser.parse('x = true'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Variable('true')
  )
]);

tap.same(parser.parse('x = False'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), false)
]);

tap.same(parser.parse('x = 1'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('x = 1\n'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 1)
]);

tap.same(parser.parse('x = -1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('negation', 1)
  )
]);

tap.same(parser.parse('x = !1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('inversion', 1)
  )
]);

tap.same(parser.parse('x = 1 == 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('equal', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 != 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('inequal', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 > 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('gt', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 < 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('lt', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 >= 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('gte', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 <= 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('lte', 1, 1)
  )
]);

tap.same(parser.parse('x = 1 AND 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('conjunction', 1, 1)
  )
]);

// make sure parser parses AND separately
tap.same(parser.parse('x = xANDy'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Variable('xANDy')
  )
]);

tap.same(parser.parse('x = 1 OR 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('disjunction', 1, 1)
  )
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
  ], []),
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
  ], []),
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

// nested if-s
ifElseStr = `If 1 Then
  Print 1
  If 2 Then
    Print 2
  EndIf
Else
  Print 3
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt(1, [
    new nodes.KeywordAction('Print', 1),
    new nodes.IfElseStmt(2, [
      new nodes.KeywordAction('Print', 2),
    ])
  ], [
    new nodes.KeywordAction('Print', 3),
  ]),
]);

var loopStr;

loopStr = `Loop:i=1 to 10
  Print i
EndLoop
`;
tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), 1, 10, [
      new nodes.KeywordAction('Print', new nodes.Variable('i'))
    ]),
]);

// nested loops
loopStr = `Loop:i=1 to 10
  Loop:j=1 to 10
    Print j
  EndLoop
EndLoop
`;

tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), 1, 10, [
      new nodes.LoopStmt(
        new nodes.Variable('j'), 1, 10, [
          new nodes.KeywordAction('Print', new nodes.Variable('j'))
        ])
    ]),
]);
