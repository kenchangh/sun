var exports = module.exports;
var parser = require('./parser');
var utils = require('./utils');
var flattenObject = utils.flattenObject;
var unescapeSource = utils.unescapeSource;
var NativeObject = require('./nodes').NativeObject;


function NativeFunction(fn) {
  var wrapper = function() {
    var args = Array.prototype.slice.call(arguments);
    var context = args.shift();
    var output = fn.apply(this, args);

    if (typeof output === 'object') {
      output = new NativeObject(flattenObject(output));
    }
    return output;
  };
  // for access without need of SunCompiler context
  wrapper.fn = fn;
  return wrapper
}

exports.rand = function rand() {
  min = 0;
  max = 32767;
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.parseSunSource = new NativeFunction(function parseSunSource(src) {
  // used from within a source code
  // so need to unescape the unescape the string first
  return parser.parse(unescapeSource(src));
});

exports.getAllFeatures = new NativeFunction(function getAllFeatures(flatParseTree) {
  var keys = Object.keys(flatParseTree);
  var typeKeys = keys.filter(function(key) {
    return key.split('|').find(function(index) {
      return index === 'type';
    });
  });
  var features = typeKeys.map(function(key) {
    return flatParseTree[key];
  });
  return features;
});

exports.size = new NativeFunction(function size(node) {
  var keys = Object.keys(node);
  var firstIndices = keys.map(function(key) {
    var firstIndex = key.split('|')[0];
    return parseInt(firstIndex, 10);
  });
  firstIndices.forEach(function(index) {
    if (isNaN(index)) {
      throw new Error('Can only get size of arrays, not dictionaries');
    }
  });
  return firstIndices.length;
});

exports.throwNotImplementedError = new NativeFunction(function(featureNotImplemented) {
  throw new utils.NotImplementedError(featureNotImplemented);
});
