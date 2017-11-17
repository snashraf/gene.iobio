var gulp = require('gulp');
var nightwatch = require('gulp-nightwatch');
var util = require('gulp-util');
var jasmineBrowser = require('gulp-jasmine-browser');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var jshint = require('gulp-jshint');

var fork = require('child_process').fork;
var args = require('yargs').argv;
var child;

gulp.task('start-server', function(done) {
  log('Starting the test server');
  process.env.PORT = 3008;
  child = fork('./server.js');
  done();
});

gulp.task('jshint', function() {
  return gulp.src(["./e2e/**/*_spec.js", "./e2e/page_objects/**/*.js"])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
})

gulp.task('nightwatch', ['start-server', 'jshint'], function() {
  var cliArgs = JSON.parse(JSON.stringify(args));
  if (args.e) { cliArgs['env'] = args.e; }
  return gulp.src([])
    .pipe(nightwatch({
      configFile: 'nightwatch.json',
      cliArgs: cliArgs
    })).on('error', function(err) {
      if (child) { child.kill(); }
    });
});

gulp.task('e2e', ['nightwatch'], function(done) {
  // Use --env or -e to specify which test environment to use (e.g. gulp e2e -e chrome)
  if (child) {
    log('Shutting down the test server.');
    child.kill();
  }
  done();
});

gulp.task('jasmine', function() {
  var fileConfig = getKarmaFiles();
  var files = fileConfig.files;
  var excludedFiles = fileConfig.excludedFiles;
  var watchedFiles = files.concat(excludedFiles);
  return gulp.src(watchedFiles)
    .pipe(watch(watchedFiles))
    .pipe(plumber())
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server({port: 8888}));
});


function getKarmaFiles() {
  // Hack to get array of files from karma.conf.js
  var files = [];
  var excludes;
  var mockConfig = {
    set: function(obj) {
      obj.files.forEach(function(file) {
        if (typeof file === 'string') { files.push(file); }
      });
      excludes = obj.exclude;
    }
  }
  require('./karma.conf.js')(mockConfig);
  var excludedFiles = excludes.map(function(excludedFile) {
    return '!' + excludedFile;
  });
  return { files: files, excludedFiles: excludedFiles };
}

function log(message) {
  util.log(util.colors.blue(message));
}


