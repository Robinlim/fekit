// Generated by CoffeeScript 1.7.1
(function() {
  var DateTool, EscapeTool, MathTool, NumberTool, Velocity, cjson, fs, path, utils, _;

  Velocity = require('velocityjs');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  utils = require('../../util');

  cjson = require('cjson');

  EscapeTool = require('../tools/EscapeTool');

  MathTool = require('../tools/MathTool');

  DateTool = require('../tools/DateTool');

  NumberTool = require('../tools/NumberTool');

  exports.contentType = "html";

  exports.process = function(txt, p, module, cb) {
    var baseVmPath, filePaths, ps;
    filePaths = p.replace(/(\\|\/)vm\1/g, '$1data$1').replace('.vm', '.json');
    ps = p.split(path.sep);
    baseVmPath = ps.slice(0, _.indexOf(ps, 'vm') + 1).join(path.sep);
    return fs.exists(filePaths, function(exists) {
      var context, macros, _render;
      if (!exists) {
        cb("" + filePaths + " file not exists!");
        return;
      }
      _render = function(data, ctx, macros) {
        return (new Velocity.Compile(Velocity.Parser.parse(data))).render(ctx, macros);
      };
      context = cjson.load(filePaths);
      context.esc = EscapeTool;
      context.date = DateTool;
      context.math = MathTool;
      context.number = NumberTool;
      macros = {
        load: function(path) {
          return this.jsmacros.parse.call(this, path);
        },
        parse: function(path) {
          var content;
          content = utils.file.io.read(baseVmPath + path);
          return _render(content, this.context, this.macros);
        },
        ver: function(path) {
          return '';
        }
      };
      return cb(null, _render(txt, context, macros));
    });
  };

}).call(this);
