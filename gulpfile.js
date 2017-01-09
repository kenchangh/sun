var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var Parser = require('jison').Parser;

var grammar = require('./src/grammar');
var SunCompiler = require('./src/sun');

gulp.task('generate-parser', function(cb) {
  var parser = new Parser(grammar);
  var parserSource = parser.generate();
  fs.writeFile('./build/sun-parser.js', parserSource, function(err) {
    cb(err);
  });
});

gulp.task('run-examples', function() {
  var examplesDir = './examples';
  var compiler = new SunCompiler();

  fs.readdir(examplesDir, function(err, files) {
    files.forEach(function(file) {
      console.log(`\n\n${file}`);
      var src = fs.readFileSync(path.join(examplesDir, file));
      compiler.compile(src.toString());
    })
  });
});

gulp.task('default', ['generate-parser']);
