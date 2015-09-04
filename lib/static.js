/**
 * module depedencies
 */
var send = require('koa-send');
var pathFn = require('path');

module.exports = function() {
  return function * predatorStatic(next) {
    var basePath = this.basePath; // /:component/ img|fonts|less
    return yield send(this, this.originalPath, {
      root: pathFn.join(__dirname, '../app')
    });
  }
}