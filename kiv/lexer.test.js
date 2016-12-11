var tap = require('tap');
var lexer = require('../lexer');

/* test variable */
tap.same(lexer.setInput('_hey').lex(), { type: 'ID', value: '_hey' });
tap.same(lexer.setInput('hey').lex(), { type: 'ID', value: 'hey' });

// tap.throws(function() {
  // lexer.setInput('5hey').lex());
// }, {});
tap.throws(function() {
  lexer.setInput('-hey').lex();
}, {});

/* test int */
tap.same(lexer.setInput('1').lex(), { type: 'INT', value: 1 });
tap.same(lexer.setInput('+22').lex(), { type: 'INT', value: 22 });
tap.same(lexer.setInput('-1').lex(), { type: 'INT', value: -1 });

tap.same(lexer.setInput('+1.0').lex(), { type: 'FLOAT', value: 1.0 });
tap.same(lexer.setInput('-22.00').lex(), { type: 'FLOAT', value: -22.0 });
tap.same(lexer.setInput('1.50000009').lex(), { type: 'FLOAT', value: 1.50000009 });

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

