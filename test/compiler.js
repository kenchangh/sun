var tap = require('tap');
var SunCompiler = require('../');
var compiler = new SunCompiler();

tap.throws(function() {
  // number cannot add string
  compiler.compile('x = 1 + "asd"');
});

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
