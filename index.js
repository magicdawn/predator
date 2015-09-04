var app = require('koa')();
var Router = require('impress-router');
var router = Router();
var pathFn = require('path');
var fs = require('fs');
var serve = require('koa-static');
global.Promise = require('bluebird');
var co = require('co');
var _ = require('lodash');
var debug = require('debug')('predator:demo');


// use router
app.use(router);


// create predator
global.predator = require('predator-kit')({
  home: __dirname,
  app: app,
  router: router
});

/**
 * when
 *   - production, we use `/public` dir
 *   - otherwise, we load a bunch of middlewares
 */
if (app.env === 'production') {
  app.use(serve(__dirname + '/public'));
} else {
  /**
   * img fonts assets
   */
  router.use('/:component/img', predator.static());
  router.use('/:component/fonts', predator.static());
  router.use('/:component/assets', predator.static());

  /**
   * less
   *
   * only `css/main/*.css` should be handled via less
   */
  router.get('/:component/css/:css+.css', function * (next) {
    if (_.startsWith(this.params.css, 'main/')) {
      var appHome = pathFn.join(__dirname, 'app');
      var parsed = pathFn.parse(this.originalPath);
      var lessFile = pathFn.join(appHome, parsed.dir, parsed.name + '.less');
      debug('css -> less : %s -> %s', this.path, lessFile);

      this.type = 'css';
      this.body = yield predator.renderLessAsync(lessFile);
    } else {
      yield * next;
    }
  }, predator.static());

  /**
   * js
   *
   * only `js/main/*.js` should be handled via browserify
   */
  router.get('/:component/js/:js+.js', function * (next) {
    if (_.startsWith(this.params.js, 'main/')) {
      var appHome = pathFn.join(__dirname, 'app');
      var parsed = pathFn.parse(this.originalPath);
      var jsFile = pathFn.join(appHome, parsed.dir, parsed.name + parsed.ext);
      this.type = 'js';
      this.body = predator.createBrowserifyStream(jsFile); // stream
    } else {
      yield * next;
    }
  }, predator.static());
}

/**
 * 使用所有的router
 * index.js
 */
predator.loadAllRouter();

/**
 * here we go
 */

var port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log('predator demo runing at http://localhost:%s', this.address().port);
});