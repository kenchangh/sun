var gulp = require('gulp');
var fs = require('fs');

var grammar = require('./src/grammar');
var Parser = require('jison').Parser;

gulp.task('generate-parser', function(cb) {
  var parser = new Parser(grammar);
  var parserSource = parser.generate();
  fs.writeFile('./build/sun-parser.js', parserSource, function(err) {
    cb(err);
  });
});

gulp.task('default', ['generate-parser']);
