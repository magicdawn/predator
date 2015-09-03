var fs = require('fs');
var path = require('path');

module.exports = function(app, rootDir) {
  rootDir = path.resolve(rootDir);
  var files = fs.readdirSync(rootDir);

  files
    .filter(function(f) {
      var s = fs.statSync(path.join(rootDir, f));
      return s.isDirectory();
    })
    .forEach(function(f) {
      var router = require(path.join(rootDir, f, 'index'));
      app.use(router);
    });
};