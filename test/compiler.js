var tap = require('tap');
var SunCompiler = require('../src/sun');

var compiler;

/* test interface for SunCompiler here */
compiler = new SunCompiler(true);

compiler.setPrintHook(function() {});
tap.ok(compiler.printHook);
compiler.setEnterHook(function() {});
tap.ok(compiler.enterHook);

tap.throws(function() {
  compiler.parseNode(null);
});

/* production interface for SunCompiler */
compiler = new SunCompiler();
compiler.compile('x = 1 + 1');
tap.same(compiler.context, {});
tap.same(compiler.outputBuffer, []);

/* basics of operators and expressions */

compiler = new SunCompiler(true); // true for debug flag

tap.throws(function() {
  compiler.parseNode({type: 'random'});
});

tap.throws(function() {
  compiler.parseNode(null);
});

tap.throws(function() {
  // number cannot add string
  compiler.compile('x = 1 + "asd"');
});
compiler.reset();

tap.throws(function() {
  // number cannot add string
  compiler.compile('x = "asd" + 1');
});
compiler.reset();

tap.throws(function() {
  // first usage error
  compiler.compile('Print x');
});
compiler.reset();

compiler.compile('x = !1');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = -1');
tap.same(compiler.context, { x: -1 });
compiler.reset();

compiler.compile('x = 1 == 1');
tap.same(compiler.context, { x: true });
compiler.reset();

compiler.compile('x = 1 != 1');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = 1 > 2');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = 1 < 2');
tap.same(compiler.context, { x: true });
compiler.reset();

compiler.compile('x = 1 >= 2');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = 1 <= 2');
tap.same(compiler.context, { x: true });
compiler.reset();

compiler.compile('x = 1 AND 0');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = 1 OR 0');
tap.same(compiler.context, { x: true });
compiler.reset();

tap.throws(function() {
  compiler.compile('x = 1 / 0');
});
compiler.reset();

compiler.compile('x = 1 % 5');
tap.same(compiler.context, { x: 1 });
compiler.reset();

compiler.compile('x = 1 + 1\nPrint x');
tap.same(compiler.context, { x: 2 });
tap.same(compiler.outputBuffer, [2]);
compiler.reset();

compiler.compile('x = 1\ny = (5-1)*5/6+7');
tap.same(compiler.context, { x: 1, y: 10.333333333333334 });
compiler.reset();

compiler.compile("x = 'a'");
tap.same(compiler.context, { x: 'a' });
compiler.reset();

compiler.compile("Print 'hello world'");
tap.same(compiler.context, {});
tap.same(compiler.outputBuffer, ['hello world']);
compiler.reset();

compiler.compile("Print (5-1)*5/6+7");
tap.same(compiler.context, {});
tap.same(compiler.outputBuffer, [10.333333333333334]);
compiler.reset();

var ifElseStr;

ifElseStr = `If 1 Then
  x = 1
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, { x: 1 });
compiler.reset();

ifElseStr = `If 0 Then
  x = 1
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, {});

ifElseStr = `If 1 Then
  x = 1
Else
  x = 2
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, { x: 1 });
compiler.reset();

ifElseStr = `If 0 Then
  x = 1
Else
  x = 2
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, { x: 2 });
compiler.reset();

var loopStr;

loopStr = `Loop:i=1 to 10
  Print i
EndLoop:i`
compiler.compile(loopStr);
tap.same(compiler.outputBuffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
compiler.reset();

// test nested loops
loopStr = `Loop:i=1 to 10
  Loop:j=1 to 10
    Print j
  EndLoop:j
EndLoop:i`
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
EndWhile`;
compiler.compile(whileStr);
tap.same(compiler.outputBuffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
compiler.reset();


/* ARRAYS */

compiler.compile('A[0] = 1');
tap.same(compiler.context, { A: {'0': 1} });
compiler.reset();

compiler.compile('A[0][2] = 1');
tap.same(compiler.context, { A: {'0,2': 1} });
compiler.reset();

compiler.compile('A[0][2] = 1\nPrint A[0][2]');
tap.same(compiler.context, { A: {'0,2': 1} });
tap.same(compiler.outputBuffer, [1]);
compiler.reset();

tap.throws(function() {
  // A[0] not declared
  compiler.compile('Print A[0]');
});
compiler.reset();

tap.throws(function() {
  // wrongly access elements of existing variable
  compiler.compile('A = 1\nPrint A[0]');
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
tap.same(compiler.context, { A: { '1': 1 }, i: 1 })
tap.same(compiler.outputBuffer, [1])
compiler.reset();

compiler.compile('i = 1\nA[i] = 1');
tap.same(compiler.context, { A: { '1': 1 }, i: 1 })
compiler.reset();

tap.throws(function() {
  // no non-integer indexes
  compiler.compile('A["x"] = 1');
});

tap.throws(function() {
  // no non-integer indexes
  compiler.compile('A[2.5] = 1');
});
