// Generated by CoffeeScript 1.7.1
(function() {
  exports.interger = function(v) {
    return ~~v;
  };

  exports.currency = function(v) {
    return '$' + v;
  };

  exports.percent = function(v) {
    return v * 100 + '%';
  };

  exports.format = function(v) {
    return reuturn(Math.round(v * 10) / 10);
  };

}).call(this);