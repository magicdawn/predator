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
 * get md5 of content
 */
var Hash = {
  /**
   * for file
   */
  file: function(file) {
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
  },

  /**
   * for string
   */
  string: function(s) {
    return require('crypto').createHash('md5').update(s).digest('hex').substr(0, 8);
  }
}

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
gulp.task('build', function(cb) {
  var staticFiles = glob.sync('*/@(img|assets)/**/*.*', {
    cwd: __dirname + '/app'
  });

  // compute hash
  staticFiles = staticFiles.map(function(item) {
    var file = __dirname + '/app/' + item;
    var hash = Hash.file(file);
    var parsed = pathFn.parse(item);

    return ret = {
      original: item,
      hashed: parsed.dir + '/' + parsed.name + '_' + hash + parsed.ext
    };
  });

  // copy
  staticFiles.forEach(function(item) {

    // set rev map
    rev[item.original] = item.hashed;

    // copy
    var src = 'app/' + item.original;
    var dest = 'public/' + item.hashed;
    copy(src, dest);
    gutil.log('predator:static %s -> %s', src, dest);
  });

  // 只复制,不hash
  glob.sync('*/fonts/**/*', {
    cwd: __dirname + '/app'
  })
    .forEach(function(item) {
      var src = 'app/' + item;
      var dest = 'public/' + item;
      copy(src, dest);
    });

  co(function * () {
    // less
    var renderAsync = require('lib/less').renderAsync;
    var lessFiles = glob.sync('*/css/**/*.less', {
      cwd: __dirname + '/app'
    });
    for (var i = 0; i < lessFiles.length; i++) {
      var item = lessFiles[i];

      // less file path
      var less = 'app/' + item;
      var content = yield renderAsync(less, {
        sourceMap: null
      });

      // replace with hashed resource
      var escape = require('escape-regexp');
      _.forOwn(rev, function(hashed, original) {
        var reg = new RegExp(escape(original), 'g');
        content = content.replace(reg, hashed);
      });

      // generate hash rev
      var hash = Hash.string(content);
      var parsed = pathFn.parse(item);
      var original = parsed.dir + '/' + parsed.name + '.css'; // 原来请求的CSS位置
      var hashed = parsed.dir + '/' + parsed.name + '_' + hash + '.css'; // hash 之后CSS位置
      rev[original] = hashed;

      // write to `public`
      var dest = 'public/' + hashed;
      if (!fs.existsSync(pathFn.dirname(dest))) {
        require('mkdirp').sync(pathFn.dirname(dest));
      }
      fs.writeFileSync(dest, content, 'utf8');
      gutil.log('predator:less', 'css generated : ', dest);
    }

    // js
    var jsFiles = glob.sync('*/js/**/*.@(js|json)', {
      cwd: __dirname + '/app'
    });
    var bundle = require('lib/browserify').bundle;
    require('browserify').prototype.bundleAsync = Promise.promisify(require('browserify').prototype.bundle);

    // for (var i = 0; i < jsFiles.length; i++) {
    //   var item = jsFiles[i];

    //   // js file path
    //   var file = 'public/' + item;
    //   var content = yield bundle(file).bundleAsync();

    //   // rev hash
    //   var hash = Hash.string(content);
    //   var parsed = pathFn.parse(item);
    //   var original = item;
    //   var hashed = parsed.dir + '/' + parsed.name + '_' + hash + parsed.ext
    // };

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