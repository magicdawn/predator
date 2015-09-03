var app = require('koa')();
var Router = require('impress-router');
var router = Router();
app.use(router);

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
app.use(defaultView(__dirname));

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
 *
 *
 *
 */
router.get('/:component/css/:css+.css', function * () {
  this.body = {
    component: this.params.component,
    css: this.params.css,
    path: '/' + this.params.component + '/css/' + this.params.css + '.less'
  };
});


/**
 * js
 * middleware & build
 */
router.get('/:component/js/:js+.js', function * () {
  this.body = {
    component: this.params.component,
    js: this.params.js
  }
});


/**
 * here we go
 */

var port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log('predator demo runing at http://localhost:%s', this.address().port);
})