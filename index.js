var parser = require('./parser');

function parseNode(node) {

}

function compile(source) {
  var parseTree = parser.parse(source);
  for (var i=0; i < parseTree.length; i++) {
    parseNode(parseTree[i]);
  }
}

function SunCompiler() {
	this.compile = compile;
}
