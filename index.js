var app = require('koa')();
var Router = require('impress-router');
var router = Router();
app.use(router);
var pathFn = require('path');
var fs = require('fs');
var predator = {};

/**
 * 使用所有的router
 * index.js
 */
require('./lib/load-router')(app, __dirname + '/app');

/**
 * 渲染所有的 view
 * app
 *   page
 *     views
 *       foo.swig
 *     index.js
 *
 * view_middle_ware
 *
 * var render = require('predator').view(__dirname);
 * yield this.render('foo')
 */
var defaultView = require('./lib/view').defaultView;
// app.use(defaultView(__dirname));

/**
 * less
 *
 * less middleware & build
 *
 * app
 *   - global
 *     - css
 *       global.less
 *       some.less
 *     index.js
 *   - index
 *     - css
 *       index.less
 *     index.js
 */
predator.less = require('lib/less');
router.get('/:component/css/:css+.css', function * () {
  var debug = require('debug')('predator:css:middleware');
  var lessFile = pathFn.join(__dirname, 'app',
    this.params.component, 'css', this.params.css + '.less');
  debug('path: %s -> less file: %s', this.path, lessFile);

  this.type = 'css';
  this.body = yield predator.less.renderAsync(lessFile);
});


/**
 * js
 * middleware & build
 */
predator.browserify = require('lib/browserify');
router.get('/:component/js/:js+.js', function * () {
  this.type = 'js';
  var js = '/' + this.params.component + '/js/' + this.params.js;
  this.body = predator.browserify.bundle(js); // stream
});

/**
 * img fonts assets
 */
predator.static = require('lib/static');
router.use('/:component/img', predator.static());
router.use('/:component/fonts', predator.static());
router.use('/:component/assets', predator.static());


/**
 * here we go
 */

var port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log('predator demo runing at http://localhost:%s', this.address().port);
})