var tap = require('tap');
var SunCompiler = require('../src/sun');
var nodes = require('../src/nodes');

var compiler;

/* test interface for SunCompiler here */
compiler = new SunCompiler({ debug: true });

compiler.setPrintHook(function() {});
tap.ok(compiler.printHook);
compiler.setEnterHook(function() {});
tap.ok(compiler.enterHook);

/* production interface for SunCompiler */
compiler = new SunCompiler();
compiler.compile('x = 1 + 1');
tap.same(compiler.contexts, {});
tap.same(compiler.outputBuffer, []);


compiler = new SunCompiler({ debug: true });
runCompilerTests(compiler);

compiler = new SunCompiler({ debug: true, bootstrap: true});
runCompilerTests(compiler);


// switch out compiler instances for all tests
function runCompilerTests(compiler) {

/* basics of operators and expressions */

tap.throws(function() {
  compiler.parseNode('global', null);
});

tap.throws(function() {
  compiler.compile('x = 1 / "asd"');
});
compiler.reset();

tap.throws(function() {
  compiler.compile('x = "asd" * 1');
});
compiler.reset();

tap.throws(function() {
  compiler.compile('x = "asd" + 1');
});
compiler.reset();

tap.throws(function() {
  compiler.compile('x = 1 + "1"');
});
compiler.reset();

tap.throws(function() {
  // first usage error
  compiler.compile('Print x');
});
compiler.reset();

// unescape newlines from source
compiler.compile('Print "\\n"');
tap.same(compiler.outputBuffer, ['\n']);
compiler.reset();


try {
  compiler.compile('Error "hey"');
} catch(e) {
  tap.equal(e.message, 'hey');
}

// should be uppercase True instead of true
compiler.compile('x= True\nPrint x');
tap.same(compiler.outputBuffer, ['True']);
compiler.reset();

compiler.compile('x = !1');
tap.same(compiler.contexts, { global: { x: false } });
compiler.reset();

compiler.compile('x = -1');
tap.same(compiler.contexts, { global: { x: -1 } });
compiler.reset();

compiler.compile('x = 1 == 1');
tap.same(compiler.contexts, { global: { x: true } });
compiler.reset();

compiler.compile('x = 1 != 1');
tap.same(compiler.contexts, { global: { x: false  } });
compiler.reset();

compiler.compile('x = 1 > 2');
tap.same(compiler.contexts, { global: { x: false } });
compiler.reset();

compiler.compile('x = 1 < 2');
tap.same(compiler.contexts, { global: { x: true } });
compiler.reset();

compiler.compile('x = 1 >= 2');
tap.same(compiler.contexts, { global: { x: false } });
compiler.reset();

compiler.compile('x = 1 <= 2');
tap.same(compiler.contexts, { global: { x: true } });
compiler.reset();

compiler.compile('x = 1 AND 0');
tap.same(compiler.contexts, { global: { x: false } });
compiler.reset();

compiler.compile('x = 1 OR 0');
tap.same(compiler.contexts, { global: { x: true } });
compiler.reset();

compiler.compile('x = 0 OR 1');
tap.same(compiler.contexts, { global: { x: true } });
compiler.reset();

tap.throws(function() {
  compiler.compile('x = 1 / 0');
});
compiler.reset();

compiler.compile('x = 1 % 5');
tap.same(compiler.contexts, { global: { x: 1 } });
compiler.reset();

compiler.compile('Print "hello "+"world"');
tap.same(compiler.outputBuffer, ['hello world']);
compiler.reset();

compiler.compile('x = 1 + 1\nPrint x');
tap.same(compiler.contexts, { global: { x: 2 } });
tap.same(compiler.outputBuffer, [2]);
compiler.reset();

compiler.compile('x = 1\ny = (5-1)*5/6+7');
tap.same(compiler.contexts, { global: { x: 1, y: 10.333333333333334 } });
compiler.reset();

compiler.compile("x = 'a'");
tap.same(compiler.contexts, { global: { x: 'a' } });
compiler.reset();

compiler.compile("Print 'hello world'");
tap.same(compiler.contexts, { global: {} });
tap.same(compiler.outputBuffer, ['hello world']);
compiler.reset();

compiler.compile("Print (5-1)*5/6+7");
tap.same(compiler.contexts, { global: {} });
tap.same(compiler.outputBuffer, [10.333333333333334]);
compiler.reset();

tap.throws(function() {
  // no reassigning to different types
  compiler.compile("x = 'a'\nx=1");
});
compiler.reset();

var ifElseStr;

ifElseStr = `If 1 Then
  x = 1
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.contexts, { global: { x: 1 } });
compiler.reset();

ifElseStr = `If 0 Then
  x = 1
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.contexts, { global: {} });

ifElseStr = `If 1 Then
  x = 1
Else
  x = 2
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.contexts, { global: { x: 1 } });
compiler.reset();

ifElseStr = `If 0 Then
  x = 1
Else
  x = 2
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.contexts, { global: { x: 2 } });
compiler.reset();

// x2 for all
ifElseStr = `
x = 3
If x == 1 Then
  Print x*1
ElseIf x == 2
  Print x*2
ElseIf x == 3
  Print x*3
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.outputBuffer, [9]);
compiler.reset();

var loopStr;

loopStr = `Loop:i='a' to 10
  Print i
LoopEnd:i`

// checks for loop start point to be number
tap.throws(function() {
  compiler.compile(loopStr);
});
compiler.reset();

loopStr = `Loop:i=1 to 'a'
  Print i
LoopEnd:i`

// checks for loop start point to be number
tap.throws(function() {
  compiler.compile(loopStr);
});
compiler.reset();

loopStr = `Loop:i=1 to 10
  Print i
LoopEnd:i`
compiler.compile(loopStr);
tap.same(compiler.outputBuffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
compiler.reset();

// test nested loops
loopStr = `Loop:i=1 to 10
  Loop:j=1 to 10
    Print j
  LoopEnd:j
LoopEnd:i`
compiler.compile(loopStr);
var arr = [];
for (var i=1; i < 11; i++) {
  for (var j=1; j < 11; j++) {
    arr.push(j);
  }
}
tap.same(compiler.outputBuffer, arr);
compiler.reset();



var whileStr;

whileStr = `i = 1
While i <= 10
  Print i
  i = i + 1
WhileEnd`;
compiler.compile(whileStr);
tap.same(compiler.outputBuffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
compiler.reset();


/* ARRAYS */

compiler.compile('A[0] = 1');
tap.same(compiler.contexts, { global: { A: {'0': 1} } });
compiler.reset();

compiler.compile('A[0][2] = 1');
tap.same(compiler.contexts, {
  global: { A: { 0: { 2: 1 } } }
});
compiler.reset();

compiler.compile('A[0][2] = 1\nPrint A[0][2]');
tap.same(compiler.outputBuffer, [1]);
compiler.reset();

// dont overwrite previous object
compiler.compile('A[0][2] = 1\nA[0][1] = 2');
tap.same(compiler.contexts, {
  global: { A: { 0: { 1: 2, 2: 1, } } },
});
compiler.reset();

// string keys, float keys, boolean keys will work as well
compiler.compile(`
A["key1"][0]["key 2"][6.9][True][False] = 1
Print A["key1"][0]["key 2"][6.9][True][False]`);
tap.same(compiler.contexts, {
  global: {
    A: { key1: { 0: { 'key 2': { 6.9: { True: { False: 1  } } } } } }
  }
});
tap.same(compiler.outputBuffer, [1]);

tap.throws(function() {
  compiler.compile('A[0] = 1\nB[A] = 1');
});
compiler.reset();

tap.throws(function() {
  // A[0] not declared
  compiler.compile('Print A[0]');
});
compiler.reset();

tap.throws(function() {
  // wrongly access elements of existing variable
  compiler.compile('A = 1\nPrint A[0]');
  console.log(compiler.outputBuffer)
});
compiler.reset();

tap.throws(function() {
  // wrongly access elements of existing variable
  compiler.compile('A = 1\nA[0] = 2');
});
compiler.reset();

tap.throws(function() {
  // wrongly access elements of existing variable
  compiler.compile('A[0] = 1\nPrint A[1]');
});
compiler.reset();

compiler.compile('i = 1\nA[1] = 1\nPrint A[i]');
tap.same(compiler.contexts, { global: { A: { '1': 1 }, i: 1 } })
tap.same(compiler.outputBuffer, [1])
compiler.reset();

compiler.compile('i = 1\nA[i] = 1');
tap.same(compiler.contexts, {
  global: {
    i: 1,
    A: { '1': 1 },
  }
})
compiler.reset();


/* FUNCTIONS HERE */

var functionStr;

// illegal return
tap.throws(function() {
  compiler.compile('Return "a"');
});

functionStr = `
Print 'a'
Function PrintLyrics()
  Print "I'm a lumberjack and I'm okay"
End
Function PrintName(name)
  Print name
End
`;
compiler.compile(functionStr);
tap.same(compiler.functions, {
  PrintLyrics: new nodes.FunctionStmt('PrintLyrics', [], [
    new nodes.PrintStmt("I'm a lumberjack and I'm okay")
  ]),
  PrintName: new nodes.FunctionStmt('PrintName', [
    new nodes.FunctionParam('name')
  ], [
    new nodes.PrintStmt(new nodes.Variable('name'))
  ])
});
compiler.reset();

functionStr = `
Function ReturnName(name, age)
  Return name
End
`;

compiler.compile(functionStr);
tap.ok(compiler.functions.ReturnName);
tap.same(compiler.contexts, {
  global: {},
});
compiler.reset();

functionStr = `Function PrintNameAndAge(name, age)
  Print name
  Print age
End

PrintNameAndAge("chan")
`
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();

functionStr = `Function PrintNameAndAge(name, age)
  Print name
  Print age
End

PrintNameAndAge("chan", 16, 16)
`
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();

functionStr = `Function PrintNameAndAge(name, age)
  Print name
  Print age
End

SomeRandomFunctionName()
`
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();

// actually calling the function
functionStr = `Function PrintName(name)
  Print name
End

PrintName("chan")
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, ['chan']);
compiler.reset();

// multiple arguments
functionStr = `Function PrintNameAndAge(name, age)
  Print name
  Print age
End

PrintNameAndAge("chan", 16)
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, ['chan', 16]);
compiler.reset();

functionStr = `Function Add(a, b)
  Return a + b
End
Print Add(1, 2)
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, [3]);
compiler.reset();

// skipped subsequent lines after Return
functionStr = `Function Add(a, b)
  Return a + b
  Print a
End
Print Add(1, 2)
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, [3]);
compiler.reset();

// skipped subsequent lines after Return
functionStr = `Function Add(a, b)
  If 1 Then
    If 2 Then
      Return a + b
    EndIf
    Print a
  EndIf
  Print a
End
Print Add(1, 2)
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, [3]);
compiler.reset();

functionStr = `
Function Factorial(n)
  If n == 1 Then
    Return 1
  EndIf
  Return n * Factorial(n-1)
End

Print Factorial(5)
`
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, [120]);
compiler.reset();

functionStr = `
Function PrintName(name)
Print name
End

Start
PrintName('chan')
End
`;
compiler.compile(functionStr);
tap.same(compiler.outputBuffer, ['chan']);
compiler.reset();

functionStr = `
Function PrintName(name)
Print name
End

Start
PrintName('chan')
End
PrintName('chan')
`;
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();

functionStr = `
Function PrintName(name)
Print name
Start
Print name
End
End

Start
PrintName('chan')
End
`;
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();

// variables in context different
functionStr = `
Function ReturnName(name)
  Return name
End

Start
name = 'chan'
newName = ReturnName('hao')
End
`;
compiler.compile(functionStr);
tap.same(compiler.contexts, {
  global: {
    name: 'chan',
    newName: 'hao',
  },
  'ReturnName.0': {
    name: 'hao',
  }
});
compiler.reset();

// no nesting functions
functionStr = `
Function Func1()
  Function Func2(name)
    Print name
  End
End
Func1()
`;
tap.throws(function() {
  compiler.compile(functionStr);
});
compiler.reset();


/* test call-by-reference here */
var refStr;

refStr = `
Function PrintNameAndAge(*name, *age)
Print name
End
`;
compiler.compile(refStr);
tap.same(Object.keys(compiler.references).length, 1);
tap.same(compiler.references.PrintNameAndAge, [true, true]);
compiler.reset();

refStr = `
Function MultiplyAndStore(*n, x)
n = n * x
End

x = 5
n = 6
MultiplyAndStore(x, n)
`;
compiler.compile(refStr);
tap.same(compiler.contexts, {
  'MultiplyAndStore.0': {
    x: 6,
  },
  global: {
    x: 30,
    n: 6,
  }
});
compiler.reset();

// refStr = `
// Function SquareAll(numbers, size, b)
//   Loop:i=0 to size-1
//     numbers[i] = numbers[i] * numbers[i]
//   LoopEnd:i
// End
//
// A[0] = 1
// A[1] = 2
// A[2] = 3
// b[0] = 2
// b[1] = 4
// b[2] = 6
// SquareAll(A, 3, b)
// `;
// compiler.compile(refStr);
// tap.same(compiler.contexts, {
//   'SquareAll.0': {
//     i: 3,
//     size: 3,
//   },
//   global: {
//     A: {
//       0: 1,
//       1: 4,
//       2: 9,
//     },
//   }
// });
// compiler.reset();


/* test CaseOf here */
var caseOfStr;

caseOfStr = `
option = 2
CaseOf option
  1: Print 'hi'
  2: Print 'hey'
  Otherwise: Print 'bye'
EndOfCase
`;
compiler.compile(caseOfStr);
tap.same(compiler.outputBuffer, ['hey']);
compiler.reset();

caseOfStr = `
option = 3
CaseOf option
  1: Print 'hi'
  2: Print 'hey'
  Otherwise: Print 'bye'
EndOfCase
`;
compiler.compile(caseOfStr);
tap.same(compiler.outputBuffer, ['bye']);
compiler.reset();

}
