var tap = require('tap');
var Lexer = require('../lexer');
var lexer = new Lexer();

/* test variable */
tap.same(lexer._lexVar('_hey'), { type: 'variable', value: '_hey' });
tap.same(lexer._lexVar('hey'), { type: 'variable', value: 'hey' });
tap.notOk(lexer._lexVar('5hey'));
tap.notOk(lexer._lexVar('-hey'));

/* test int */
tap.same(lexer._lexInt('1'), { type: 'int', value: 1 });
tap.same(lexer._lexInt('22'), { type: 'int', value: 22 });
tap.same(lexer._lexInt('-1'), { type: 'int', value: -1 });
tap.notOk(lexer._lexInt('5hey'));
tap.notOk(lexer._lexInt('-hey'));

/* test objects */
tap.same(lexer._lexObject('1'), {
  type: 'object',
  value: { type: 'int', value: 1 },
});
tap.same(lexer._lexObject('22'), {
  type: 'object',
  value: { type: 'int', value: 22 },
});
tap.same(lexer._lexObject('-1'), {
  type: 'object',
  value: { type: 'int', value: -1 },
});
tap.notOk(lexer._lexObject('5hey'));
tap.notOk(lexer._lexObject('hey'));

/* test arithmetic */
lexer._lexExpr('1 + 1');

/* test basic assignment here */
// var actualAst = new Lexer().lex('x = 1 + 1');

// var expectedAst = {
//   type: 'program',
//   statements: [
//     {
//       type: 'varassign_stmt',
//       lhs: {
//         type: 'variable',
//         value: 'x',
//       },
//       rhs: {
//         type: 'expr',
//         expressions: [
//           {
//             type: 'arith_expr',
//             lhs: {
//               type: 'object',
//               value: {
                //   type: 'int',
                //   value: 1,
                // }
//             },
//             rhs: {
//               type: 'object',
//               value: {
                //   type: 'int',
                //   value: 1,
                // }
//             },
//           }
//         ]
//       },
//     }
//   ]
// }

// tap.same(actualAst, expectedAst);

