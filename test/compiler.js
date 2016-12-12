var tap = require('tap');
var SunCompiler = require('../');
var compiler = new SunCompiler();

tap.throws(function() {
  // number cannot add string
  compiler.compile('x = 1 + "asd"');
});

compiler.compile('x = 1 == 1');
tap.same(compiler.context, { x: true });
compiler.resetContext();

compiler.compile('x = 1 != 1');
tap.same(compiler.context, { x: false });
compiler.resetContext();

compiler.compile('x = 1 AND 0');
tap.same(compiler.context, { x: false });
compiler.resetContext();

compiler.compile('x = 1 OR 0');
tap.same(compiler.context, { x: true });
compiler.resetContext();

compiler.compile('x = 1 + 1\nPrint x');
tap.same(compiler.context, { x: 2 });
compiler.resetContext();

compiler.compile('x = 1\ny = (5-1)*5/6+7');
tap.same(compiler.context, { x: 1, y: 10.333333333333334 });
compiler.resetContext();

compiler.compile("x = 'a'");
tap.same(compiler.context, { x: 'a' });
compiler.resetContext();

compiler.compile("Print 'hello world'");
tap.same(compiler.context, {});

compiler.compile("Print (5-1)*5/6+7");
tap.same(compiler.context, {});

var ifElseStr;

ifElseStr = `If 1 Then
  x = 1
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, { x: 1 });
compiler.resetContext();

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
compiler.resetContext();

ifElseStr = `If 0 Then
  x = 1
Else
  x = 2
EndIf
`
compiler.compile(ifElseStr);
tap.same(compiler.context, { x: 2 });
compiler.resetContext();
