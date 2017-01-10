var tap = require('tap');
var nodes = require('../src/nodes');
var SunCompiler = require('../src/sun');
var compiler = new SunCompiler({ debug: true });
var utils = require('../src/utils');
var flattenObject = utils.flattenObject;
var escapeSource = utils.escapeSource;
var nativeFunctions = require('../src/native-functions');


var keys;

keys = flattenObject({ x: 1, y: 2, });
tap.same(keys, { x: 1, y: 2 });

keys = flattenObject([ 1, 2 ]);
tap.same(keys, { 0: 1, 1: 2 });

keys = flattenObject([
  5,
  { x: 1 },
  {
    y: [
      2,
      3
    ]
  }
]);
tap.same(keys, {
  '0': 5,
  '1|x': 1,
  '2|y|0': 2,
  '2|y|1': 3
});


compiler.compile('parseTree = parseSunSource("Print 1")');
tap.same(compiler.contexts, {
  global: {
    parseTree: flattenObject([ new nodes.PrintStmt(1) ])
  }
});
compiler.reset();

// actually using parseSunSource in Sun
var actualSrc = escapeSource(`Function PrintLyrics()
  Print "I'm a lumberjack and I'm okay"
End
`);
var bootstrapSrc = `
parseTree = parseSunSource('${actualSrc}')
`;
compiler.compile(bootstrapSrc);
tap.same(compiler.contexts, {
  global: {
    parseTree: flattenObject([
      new nodes.FunctionStmt('PrintLyrics', [], [
        new nodes.PrintStmt("I'm a lumberjack and I'm okay")
      ])
    ])
  }
});
compiler.reset();

// rand()
var functionStr = `Print rand()`;
compiler.compile(functionStr);
tap.type(compiler.nativeFunctions.rand, 'function');
tap.equal(compiler.outputBuffer.length, 1);
tap.type(compiler.outputBuffer[0], 'number');
compiler.reset();
