var createRouter = require('lib/createRouter');
var router = module.exports = createRouter();
var render = require('lib/view').getRender(__dirname);

router.get('/', function * () {
  this.type = 'html';
  this.body = yield render('index', {
    title: 'index page',
    user: 'magicdawn'
  });
});