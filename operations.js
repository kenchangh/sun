
var OPERATIONS = [
  // number 1 operand
  {
    name: 'negation',
    operands: 1,
    type: 'number',
    execution: function (a) { return -a },
  },
  // boolean 1 operand
  {
    name: 'inversion',
    operands: 1,
    type: 'boolean',
    execution: function (a) { return !a }
  },

  // number 2 operands
  {
    name: 'addition',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a + b },
  },
  {
    name: 'subtraction',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a - b },
  },
  {
    name: 'multiplication',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a * b },
  },
  {
    name: 'division',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a / b },
  },
  {
    name: 'exponentiation',
    operands: 2,
    type: 'number',
    execution: Math.pow,
  },
  {
    name: 'modulo',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a % b },
  },
  {
    name: 'gt',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a > b },
  },
  {
    name: 'lt',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a < b },
  },
  {
    name: 'gte',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a >= b },
  },
  {
    name: 'lte',
    operands: 2,
    type: 'number',
    execution: function (a, b) { return a <= b },
  },

  // boolean 2 operands
  {
    name: 'equal',
    operands: 2,
    type: 'boolean',
    execution: function (a, b) { return a === b },
  },
  {
    name: 'inequal',
    operands: 2,
    type: 'boolean',
    execution: function (a, b) { return a !== b },
  },
  {
    name: 'conjunction',
    operands: 2,
    type: 'boolean',
    execution: function (a, b) { return a && b },
  },
  {
    name: 'disjunction',
    operands: 2,
    type: 'boolean',
    execution: function (a, b) { return a || b },
  },
];

function transposeArray(array, criteria, prop) {
  var elem;
  var map = {};
  for (var i=0; i < array.length; i++) {
    elem = array[i];
    if (map[elem[criteria]] === undefined) {
      map[elem[criteria]] = [elem[prop]];
    } else {
      map[elem[criteria]].push(elem[prop]);
    }
  }
  return map;
}

function dict(tuples) {
  var map = {};
  for (var i=0; i < tuples.length; i++) {
    var tuple = tuples[i];
    map[tuple[0]] = tuple[1];
  }
  return map;
}

module.exports = {
  OPERATIONS_BY_OPERANDS: transposeArray(OPERATIONS, 'operands', 'name'),
  OPERATIONS_BY_TYPE: transposeArray(OPERATIONS, 'type', 'name'),
  OPERATION_EXECUTIONS: dict(OPERATIONS.map(function (operation) {
    return [operation.name, operation.execution];
  })),
};
