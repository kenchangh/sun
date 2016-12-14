var tap = require('tap');
var nodes = require('../src/nodes');

tap.throws(function() {
  new nodes.Operation('random', 1, 2);
});
