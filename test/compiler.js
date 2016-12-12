var tap = require('tap');
var SunCompiler = require('../');
var compiler = new SunCompiler(true); // true for debug flag

tap.throws(function() {
  // number cannot add string
  compiler.compile('x = 1 + "asd"');
});

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

compiler.compile('x = 1 AND 0');
tap.same(compiler.context, { x: false });
compiler.reset();

compiler.compile('x = 1 OR 0');
tap.same(compiler.context, { x: true });
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
EndLoop`
compiler.compile(loopStr);
tap.same(compiler.outputBuffer, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
compiler.reset();

// test nested loops
loopStr = `Loop:i=1 to 10
  Loop:j=1 to 10
    Print j
  EndLoop
EndLoop`
compiler.compile(loopStr);
var arr = [];
for (var i=1; i < 11; i++) {
  for (var j=1; j < 11; j++) {
    arr.push(j);
  }
}
tap.same(compiler.outputBuffer, arr);
compiler.reset();
