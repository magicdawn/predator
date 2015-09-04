var router = module.exports = require('impress-router')();

router.get('/hello', function * () {
  this.body = 'world';
});