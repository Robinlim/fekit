// Generated by CoffeeScript 1.7.1
(function() {
  var handlebars, syspath;

  syspath = require('path');

  handlebars = require('handlebars');

  exports.contentType = "javascript";

  exports.process = function(txt, path, module, cb) {
    var builded, err, name;
    try {
      name = syspath.basename(path, '.handlebars');
      builded = 'if(typeof window.QTMPL === "undefined"){ window.QTMPL={}; }\n';
      builded += 'window.QTMPL.' + name + ' = window.Handlebars.template(' + handlebars.precompile(txt) + ');';
      return cb(null, builded);
    } catch (_error) {
      err = _error;
      return cb(err);
    }
  };

}).call(this);