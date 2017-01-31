var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
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

gulp.task('copy-examples', function() {
  var examplesDir = './examples';

  fs.readdir(examplesDir, function(err, files) {
    var sources = files.map(function(file) {
      console.log(`Copied ${file}`);
      var src = fs.readFileSync(path.join(examplesDir, file));
      return {
        name: file,
        src: src.toString(),
      };
    });
    var ymlFile = yaml.safeDump(sources);
    fs.writeFile('./docs/_data/examples.yml', ymlFile);

    files.forEach(function(file) {
      var examplesDocDir = './docs/examples';
      var exampleDoc = path.join(examplesDocDir, file);
      if (!fs.existsSync(exampleDoc)) {
        fs.mkdirSync(exampleDoc);
      }
      var content = `---
layout: interpreter
title: Run online
---
{% for example in site.data.examples %}{% if example.name == '${file}' %}{{ example.src | strip }}{% endif %}{% endfor %}\n`
      fs.writeFileSync(path.join(exampleDoc, 'index.html'), content);
    });
  });
});

gulp.task('default', ['generate-parser']);
