// Generated by CoffeeScript 1.7.1
(function() {
  var coffee;

  coffee = require('coffee-script');

  exports.contentType = "javascript";

  exports.process = function(txt, path, module, cb) {
    var err;
    try {
      return cb(null, coffee.compile(txt));
    } catch (_error) {
      err = _error;
      return cb(err);
    }
  };

}).call(this);
