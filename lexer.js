function TypeValueObj(type, value) {
  this.type = type;
  this.value = value;
  return this;
}

function TwoSideObj(lhsTypeValue, operator, rhsTypeValue) {
  this.lhs = lhsTypeValue;
  this.operator = operator;
  this.rhs = rhsTypeValue;
  return this;
}

function lexVariable(str) {
  var re = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
  if (!str.match(re)) return false;
  return new TypeValueObj('variable', str);
}

function lexInt(str) {
  var re = /^-?[0-9]+$/;
  if (!str.match(re)) return false;
  return new TypeValueObj('int', parseInt(str, 10));
}

function lexObject(str) {
  var typeChecks = [
    lexInt,
  ];

  for (var i=0; i < typeChecks.length; i++) {
    var typeValue = typeChecks[i](str);
    if (typeValue) {
      return new TypeValueObj('object', typeValue);
    }
  }

  return false;
}

function lexOperator(str) {
  var operators = ['+', '-', '*', '/', '^'];
  // var spaceSeparedOperators = ['OR', 'AND']
  var re = /^(?:\+|-|\*|\/|\^)$/;
  if (!str.match(re)) return false;
  return new TypeValueObj('operator', str);
}

function tokenizeExpr(str) {
  var lexChecks = [
    lexObject,
    lexVariable,
    lexOperator,
  ];

  str = str.trim();
  var i = 0;
  var accumulator = str[i];
  var tokens = [];

  while (i < str.length) {
    // console.log('acc: '+accumulator)

    for (var j=0; j < lexChecks.length; j++) {
      var cur = lexChecks[j](accumulator);

      if (cur) {
        var validToken;
        i++;

        do {
          if (str[i] === ' ') {
            i++;
            continue;
          }

          if (i < str.length) {
            accumulator += str[i];
            validToken = lexChecks[j](accumulator);
            // console.log('acc: '+accumulator);
          }

          if (!validToken) {
            accumulator = str[i];
            tokens.push(cur);
            break;
          }

          cur = validToken;
        } while (i < str.length);

        break;
      }
    }
  }

  return tokens;
}

function parseTokensIntoExpr(tokenList) {
  var precedence = ['-', '+', '*', '/', '^'];

  var operators = tokenList.filter(function(typeValue) {
    return typeValue.type === 'operator';
  });
  var scores = operators.map(function(typeValue) {
    return precedence.indexOf(typeValue.value);
  });
}

var lexer = new Lexer()
console.log(lexer._tokenizeExpr('10000 +1 - 1*199/1'));

function lexCode(str) {
  var lines = str.split(/[\r\n]+/g);
}

function Lexer() {
  this.lex = lexCode;
  this._lexVar = lexVariable;
  this._lexInt = lexInt;
  this._lexObject = lexObject;
  this._tokenizeExpr = tokenizeExpr;
}

module.exports = Lexer;
