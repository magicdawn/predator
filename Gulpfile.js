global.Promise = require('bluebird');
var co = require('co');
var gulp = require('gulp');
var gutil = require('gulp-util');
var pathFn = require('path');
var fs = require('fs');

/**
 * rev map
 */
var rev = {};

/**
 * build Task
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
      'global/js/main/index.json'
    ], rev);

    // 替换 view, 复制到 view_build 文件夹
    predator.buildView([
      '*/view/**/*.*'
    ], rev);

    fs.writeFileSync(__dirname + '/rev.json', JSON.stringify(rev, null, '  '), 'utf8');
    gutil.log('predator', 'rev.json writed');
  })
    .then(function() {
      cb(null);
    })
    .catch(function(e) {
      cb(e);
      console.error(e.stack || e);
    });
});