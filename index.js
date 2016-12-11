var series = require('run-series');
var readline = require('readline');
var parser = require('./parser');
var yy = parser.yy;

module.exports = {
  compile: compile,
};

function assignVariable(varName, value) {
  yy.context[varName] = value;
}

function enterKeyword(variable, cb) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('prompt: ', function (answer) {
    // console.log(typeof answer);
    var val = parseFloat(answer);
    if (val === NaN) val = answer;
    assignVariable(variable.name, val);
    rl.close();
    cb();
  });
}

function evaluate(line, cb) {
  switch (line.type) {
    case 'assignment':
      cb();
      break;
    case 'keyword':
      var keyword = line.left;
      var value = line.right;

      if (keyword === 'Print') {
        value = yy.resolveVar(value);
        console.log(value);
        cb();
        // console.log(value);
      } else if (keyword === 'Enter') {
        enterKeyword(value, cb);
      } else {
        throw new Error('No such keyword');
      }
      break;
    default:
      break;
  }
}

function compile(source) {
  lines = parser.parse(source);
  lines = lines.map(function(line) {
    return function(cb) {
      evaluate(line, cb);
    };
  });
  series(lines);
}
