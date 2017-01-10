var exports = module.exports;
var parser = require('./parser');
var utils = require('./utils');
var flattenObject = utils.flattenObject;
var unescapeSource = utils.unescapeSource;
var NativeObject = require('./nodes').NativeObject;


function NativeFunction(fn) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    var output = fn.apply(this, args);

    if (typeof output === 'object') {
      output = new NativeObject(flattenObject(output));
    }
    return output;
  };
}

exports.parseSunSource = new NativeFunction(function parseSunSource(src) {
  // used from within a source code
  // so need to unescape the unescape the string first
  return parser.parse(unescapeSource(src));
});

exports.rand = function rand() {
  min = 0;
  max = 32767;
  return Math.floor(Math.random() * (max - min)) + min;
};
