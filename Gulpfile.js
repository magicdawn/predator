var gulp = require('gulp');
var glob = require('glob');
var pathFn = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
global.Promise = require('bluebird');
var co = require('co');
var _ = require('lodash');

/**
 * rev map
 */
var rev = {};

/**
 * build
 *
 * 1. img/fonts/asset -> copy
 * 2. css -> less
 * 3. js -> browserify
 */
gulp.task('build', function(cb) {
  process.env.NODE_ENV = 'production';
  var app = require('./app');
  var rev = {};

  /**
   * predator as global
   *
   * all glob with cwd `app/`
   */

  // just do copy
  predator.buildCopy([
    '*/fonts/**/*'
  ]);

  // name_hash.ext
  predator.buildStatic([
    '*/img/**/*.*',
    '*/assets/**/*.*'
  ], rev);

  co(function * () {
    // less -> css
    yield predator.buildLessAsync([
      '*/css/main/**/*.less'
    ], rev);

    // js
    yield predator.buildJsAsync([
      '*/js/main/**/*.js',
      'global/js/index.json'
    ], rev);

    // 替换 view, 复制到 view_build 文件夹
    predator.buildView([
      '*/view/**/*.*'
    ], rev);

    fs.writeFileSync(__dirname + '/rev.json', JSON.stringify(rev, '    ', null), 'utf8');
  })
    .then(function() {
      console.log('done');
      cb(null);
    })
    .catch(function(e) {
      cb(e);
      console.error(e.stack || e);
    });
});