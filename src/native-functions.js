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
    this.__context = context;
    return fn.apply(this, args);
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
  // so need to unescape the string first
  return parser.parse(unescapeSource(src));
});

exports.getAllFeatures = new NativeFunction(function getAllFeatures(parseTree) {
  // flatten to make searches faster
  // so context doesn't really matter
  // unwrap if it's NativeObject
  var flatParseTree = flattenObject(parseTree);
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
  var allIntKeys = keys.every(function(key) {
    return Number.isInteger(parseInt(key, 10));
  });
  if (!allIntKeys) {
    throw new Error("Array has non-integer keys");
  }
  return keys.length;
});

exports.exists = new NativeFunction(function exists(array, key) {
  return array[key] !== undefined;
});

exports.throwNotImplementedError = new NativeFunction(function(featureNotImplemented) {
  throw new utils.NotImplementedError(featureNotImplemented);
});

exports.Array = new NativeFunction(function _Array() {
  var elements = Array.prototype.slice.call(arguments);
  var array = {};
  elements.forEach(function (element, index) {
    array[index] = element;
  });
  return array;
});

exports.isArray = new NativeFunction(function isArray(node) {
  // console.log(this.contexts)
  return typeof node === 'object';
});
