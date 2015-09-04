var $ = require('jquery');
var moment = require('moment');

$(function() {
  alert('现在北京时间: ' + moment().format('YYYY-MM-DD HH:mm:ss'));
});