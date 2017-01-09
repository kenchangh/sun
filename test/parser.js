var tap = require('tap');
var parser = require('../src/parser');
var nodes = require('../src/nodes');


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

tap.same(parser.parse('x = 1 % 1'), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('modulo', 1, 1)
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
  new nodes.PrintStmt('hello world'),
]);


tap.same(parser.parse('x = 3\nPrint x'), [
  new nodes.Operation('assignment', new nodes.Variable('x'), 3),
  new nodes.PrintStmt(new nodes.Variable('x')),
]);

tap.same(parser.parse('Print (5-1)*5/6+7'), [
  new nodes.PrintStmt({
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
//   new nodes.PrintStmt(new nodes.Variable('x')),
// ]);

var ifElseStr;

ifElseStr = `If 1 Then
  Print 1
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [
      new nodes.PrintStmt(1)
    ])
  ])
]);

// alternative form of writing
ifElseStr = `If 1
Then
  Print 1
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [
      new nodes.PrintStmt(1)
    ])
  ])
]);

ifElseStr = `If 1 Then
  Print 1
  Print 2
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [
      new nodes.PrintStmt(1),
      new nodes.PrintStmt(2),
    ])
  ])
]);

ifElseStr = `If 1 Then
  Print 1
  Print 2
Else
  Print 3
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [
      new nodes.PrintStmt(1),
      new nodes.PrintStmt(2),
    ])
  ], [
    new nodes.PrintStmt(3)
  ])
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
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [
      new nodes.PrintStmt(1),
      new nodes.IfElseStmt([
        new nodes.ConditionBlock(2, [ new nodes.PrintStmt(2) ])
      ])
    ])
  ], [ new nodes.PrintStmt(3) ])
]);

ifElseStr = `
If 1 Then
  Print 1
ElseIf 2
  Print 2
ElseIf 3
  Print 3
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [ new nodes.PrintStmt(1) ]),
    new nodes.ConditionBlock(2, [ new nodes.PrintStmt(2) ]),
    new nodes.ConditionBlock(3, [ new nodes.PrintStmt(3) ]),
  ])
]);

ifElseStr = `
If 1 Then
  Print 1
ElseIf 2
  Print 2
ElseIf 3
  Print 3
Else
  Print 4
EndIf
`;

tap.same(parser.parse(ifElseStr), [
  new nodes.IfElseStmt([
    new nodes.ConditionBlock(1, [ new nodes.PrintStmt(1) ]),
    new nodes.ConditionBlock(2, [ new nodes.PrintStmt(2) ]),
    new nodes.ConditionBlock(3, [ new nodes.PrintStmt(3) ]),
  ], [ new nodes.PrintStmt(4) ])
]);

var loopStr;

loopStr = `Loop:i=1 to 10
  Print i
EndLoop:i
`;
tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), new nodes.Variable('i'), 1, 10, [
      new nodes.PrintStmt(new nodes.Variable('i'))
    ]),
]);

// alternative declaration, LoopEnd
loopStr = `Loop:i=1 to 10
  Print i
LoopEnd:i
`;
tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), new nodes.Variable('i'), 1, 10, [
      new nodes.PrintStmt(new nodes.Variable('i'))
    ]),
]);

// alternative declaration, Loop-end
loopStr = `Loop:i=1 to 10
  Print i
Loop-end:i
`;
tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), new nodes.Variable('i'), 1, 10, [
      new nodes.PrintStmt(new nodes.Variable('i'))
    ]),
]);

// alternative declaration, Loop-End
loopStr = `Loop:i=1 to 10
  Print i
Loop-End:i
`;
tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), new nodes.Variable('i'), 1, 10, [
      new nodes.PrintStmt(new nodes.Variable('i'))
    ]),
]);

// nested loops
loopStr = `Loop:i=1 to 10
  Loop:j=1 to 10
    Print j
  EndLoop:j
EndLoop:i
`;

tap.same(parser.parse(loopStr), [
  new nodes.LoopStmt(
    new nodes.Variable('i'), new nodes.Variable('i'), 1, 10, [
      new nodes.LoopStmt(
        new nodes.Variable('j'), new nodes.Variable('j'), 1, 10, [
          new nodes.PrintStmt(new nodes.Variable('j'))
        ])
    ]),
]);

// different variables for loop
loopStr = `Loop:i=1 to 10
  Print i
EndLoop:j
`;
tap.throws(function() {
  parser.parse(loopStr);
});

var whileStr;

whileStr = `While i <= 10
  Print i
EndWhile
`;

tap.same(parser.parse(whileStr), [
  new nodes.WhileStmt(
    new nodes.Operation('lte',
      new nodes.Variable('i'),
      10
    ), [
      new nodes.PrintStmt(new nodes.Variable('i')),
    ]
  )
]);

// alternative declaration WhileEnd
whileStr = `While i <= 10
  Print i
WhileEnd
`;

tap.same(parser.parse(whileStr), [
  new nodes.WhileStmt(
    new nodes.Operation('lte',
      new nodes.Variable('i'),
      10
    ), [
      new nodes.PrintStmt(new nodes.Variable('i')),
    ]
  )
])


/* ARRAYS HERE */

tap.same(parser.parse('Print A[i]'), [
  new nodes.PrintStmt(
    new nodes.Variable('A', [
      new nodes.Variable('i')
    ])
  )
]);

tap.same(parser.parse('Print A[i][1]'), [
  new nodes.PrintStmt(
    new nodes.Variable('A', [
      new nodes.Variable('i'), 1
    ])
  )
]);

tap.same(parser.parse('Print A[i]+A[j]'), [
  new nodes.PrintStmt(
    new nodes.Operation('addition',
      new nodes.Variable('A', [
        new nodes.Variable('i')
      ]),
      new nodes.Variable('A', [
        new nodes.Variable('j')
      ])
    )
  )
]);

tap.throws(function() {
  parser.parse('Print A[]');
})


/* FUNCTIONS HERE */

var functionStr;

functionStr = `Function PrintLyrics()
  Print "I'm a lumberjack and I'm okay"
End
`

tap.same(parser.parse(functionStr), [
  new nodes.FunctionStmt('PrintLyrics', [], [
    new nodes.PrintStmt("I'm a lumberjack and I'm okay")
  ])
]);

functionStr = `Function PrintName(name)
  Print name
End
`

tap.same(parser.parse(functionStr), [
  new nodes.FunctionStmt('PrintName', [
    new nodes.FunctionParam('name')
  ], [
    new nodes.PrintStmt(new nodes.Variable('name'))
  ])
]);

functionStr = `Function PrintNameAndAge(name, age)
  Print name
  Print age
End
`

tap.same(parser.parse(functionStr), [
  new nodes.FunctionStmt('PrintNameAndAge', [
    new nodes.FunctionParam('name'),
    new nodes.FunctionParam('age'),
  ], [
    new nodes.PrintStmt(new nodes.Variable('name')),
    new nodes.PrintStmt(new nodes.Variable('age')),
  ])
]);

functionStr = `Function ReturnName(name)
  Return name
End
`

tap.same(parser.parse(functionStr), [
  new nodes.FunctionStmt('ReturnName', [
    new nodes.FunctionParam('name')
  ], [
    new nodes.KeywordAction('Return',
      new nodes.Variable('name'))
  ])
]);

tap.same(parser.parse('rand'), [
  new nodes.Variable('rand'),
]);

functionStr = `rand()`;

tap.same(parser.parse(functionStr), [
  new nodes.FunctionCall('rand', []),
]);

// no arguments
functionStr = `x = rand() % 3`;

tap.same(parser.parse(functionStr), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('modulo',
      new nodes.FunctionCall('rand', []), 3)
  )
]);

// single argument
functionStr = `x = rand(1) % 3`;

tap.same(parser.parse(functionStr), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('modulo',
      new nodes.FunctionCall('rand', [1]), 3)
  )
]);

// multi arguments
functionStr = `x = rand(1, 2) % 3`;

tap.same(parser.parse(functionStr), [
  new nodes.Operation('assignment',
    new nodes.Variable('x'),
    new nodes.Operation('modulo',
      new nodes.FunctionCall('rand', [1, 2]), 3)
  )
]);

functionStr = `Start\nPrint x\nEnd`;

tap.same(parser.parse(functionStr), [
  new nodes.MainFunction([
    new nodes.PrintStmt(new nodes.Variable('x')),
  ])
]);


/* call-by-reference tests */

var refStr;

refStr = `
Function PrintName(*name)
  Print name
End
`;
tap.same(parser.parse(refStr), [
  new nodes.FunctionStmt('PrintName', [
    new nodes.FunctionParam('name', true)
  ], [
    new nodes.PrintStmt(new nodes.Variable('name'))
  ])
]);

refStr = `
Function PrintNameAndAge(name, *age)
  Print name
End
`;
tap.same(parser.parse(refStr), [
  new nodes.FunctionStmt('PrintNameAndAge', [
    new nodes.FunctionParam('name', false),
    new nodes.FunctionParam('age', true)
  ], [
    new nodes.PrintStmt(new nodes.Variable('name'))
  ])
]);
