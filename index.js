var app = require('koa')();
var Router = require('impress-router');
var router = Router();
var pathFn = require('path');
var fs = require('fs');
var serve = require('koa-static');

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
   */
  router.get('/:component/css/main/:css+.css', function * () {
    var appHome = pathFn.join(__dirname, 'app');
    var parsed = pathFn.parse(this.originalPath);
    var lessFile = pathFn.join(appHome, parsed.dir, parsed.name + '.less');
    debug('css -> less : %s -> %s', this.path, lessFile);

    this.type = 'css';
    this.body = yield predator.renderLessAsync(lessFile);
  });


  /**
   * js
   * middleware & build
   */
  router.get('/:component/js/main/:js+.js', function * () {
    var js = '/' + this.params.component + '/js/' + this.params.js;
    this.type = 'js';
    this.body = predator.browserify.bundle(js); // stream
  });
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
})