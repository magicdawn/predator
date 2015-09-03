/**
 * 获取render方法
 */

var Promise = require('bluebird');
var swig = require('swig');
var fs = require('fs');
var pathFn = require('path');

exports.getRender = function(dir) {
  // decide view base
  var base = path.join(dir, 'view');

  // render
  return function redner(view, locals) {
    return new Promise(function(resolve, reject) {
      view = pathFn.resolve(base, view + '.swig');

      // renderFile
      swig.renderFile(view, locals, function(err, res) {
        if (err) {
          return reject(e);
        }
        resolve(res);
      });
    });
  }
};

/**
 * defaultView middleware
 *
 * @param {String} dir app.js项目根目录
 */
exports.defaultView = function(dir) {

  return function * (next) {
    // you go first
    yield * next;

    // if not handled, I'll
    if (this.status === 404) {
      var path = this.originalPath || this.path;

      if (pathFn.extname(path)) {
        return;
      }

      // /
      // /abc
      // /abc/def
      var parts = path.split('/').slice(1);
      var componentName = parts[0];
      if (!componentName) {
        componentName = 'index';
      }

      // view path
      var base = pathFn.join(dir, componentName, 'view'); // base path
      var view = parts.slice(1).join('/') || 'index';
      view = pathFn.join(base, view);
      view += '.swig';

      // response
      this.type = 'html';
      this.body = yield new Promise(function(resolve, reject) {
        swig.renderFile(view, {}, function(err, res) {
          if (err) {
            return reject(err);
          }
          resolve(res);
        })
      });

      return view;
    }
  }
};