var gulp = require('gulp');
var glob = require('glob');
var pathFn = require('path');
var fs = require('fs');
var gutil = require('gulp-util');

/**
 * rev map
 */
var rev = {};

/**
 * get md5 of content
 */
var getHash = function(file) {
  file = pathFn.resolve(file);

  // text ?
  var textExts = ['.css', '.js', '.html', '.less', '.json'];
  var ext = pathFn.extname(file);
  var isText = textExts.indexOf(ext) > -1;

  // content
  var content;
  if (isText) {
    content = fs.readFileSync(file, 'utf8');
  } else {
    content = fs.readFileSync(file);
  }
  var hash = require('crypto').createHash('md5').update(content).digest('hex');
  return hash.substr(0, 8);
};

/**
 * 复制文件
 */
var copy = function(src, dest) {
  if (!fs.existsSync(src) || !dest) {
    gutil.log('copy failed : %s -> %s', src, dest);
    return;
  }

  var dir = pathFn.dirname(dest);
  if (!fs.existsSync(dir)) {
    require('mkdirp').sync(dir);
  }

  fs.createReadStream(src).pipe(fs.createWriteStream(dest));
};

/**
 * build
 *
 * 1. img/fonts/asset -> copy
 * 2. css -> less
 * 3. js -> browserify
 */
gulp.task('build', function() {
  var staticFiles = glob.sync('app/*/@(img|fonts|assets)/**/*.*');
  staticFiles = imgs.map(function(item) {
    var hash = getHash(item);
    var parsed = pathFn.parse(item);
    return {
      original: item,
      hashed: parsed.dir + '/' + parsed.name + '_' + hash + parsed.ext
    }
  });
  console.log(staticFiles);
});