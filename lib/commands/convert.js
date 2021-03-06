// Generated by CoffeeScript 1.7.1
(function() {
  var CONFIG, CSS_REG, CURR, FILE, JS_REG, LINK_CSS_REG, LINK_JS_REG, check, check_config, get_config, process_app_css, process_app_javascript, process_build, process_config, process_srclist, process_ver, show_config, spawn, sysfs, syspath, utils, _each_files, _get_verpath, _replaceCSS, _replaceJS, _replaceSrclist;

  syspath = require('path');

  sysfs = require('fs');

  utils = require('../util');

  spawn = require('child_process').spawn;

  exports.usage = "转换 [qzz项目] 为 [fekit项目] ";

  exports.set_options = function(optimist) {
    optimist.alias('q', 'qzz');
    optimist.describe('q', '转换qzz项目');
    optimist.alias('a', 'app');
    return optimist.describe('a', '转换app项目');
  };

  CURR = null;

  CONFIG = {
    "compiler": false,
    "alias": {},
    "export": []
  };

  FILE = function(name) {
    return syspath.join(CURR, name);
  };

  check = function() {
    if (!utils.path.exists(FILE(".ver"))) {
      return false;
    }
    if (utils.path.exists(FILE("fekit.config"))) {
      return false;
    }
    return true;
  };


  /*
  1. 处理 srclist
              a. 文件名变为普通
              b. 修改引用方式 document.write 变为 require , js/css的
   */

  process_srclist = function() {
    var add, add_list, remove_list;
    add_list = [];
    remove_list = [];
    utils.path.each_directory(CURR, function(file) {
      if (~file.indexOf('-srclist.') && !~file.indexOf(".svn")) {
        utils.logger.log("正在处理 " + file);
        add_list.push(_replaceSrclist(file));
        return remove_list.push(file);
      }
    }, true);
    add = spawn('svn', ['add'].concat(add_list));
    return add.on('exit', (function(_this) {
      return function(code) {
        return spawn('svn', ['rm'].concat(remove_list));
      };
    })(this));
  };

  JS_REG = /!!document\.write.*src=['"]([^'"]*)['"].*/g;

  CSS_REG = /@import\s+url\s*\(\s*['"]?([^'"\)]*)['"]?\s*\)/g;

  _replaceSrclist = function(filepath) {
    var content, dest, part, url;
    url = new utils.UrlConvert(filepath, CURR);
    dest = url.to_src().replace('-srclist', '');
    content = new utils.file.reader().read(filepath);
    content = content.replace(JS_REG, (function(_this) {
      return function($0, $1) {
        return "require('./" + $1 + "');";
      };
    })(this));
    content = content.replace(CSS_REG, (function(_this) {
      return function($0, $1) {
        return "require('./" + $1 + "');";
      };
    })(this));
    new utils.file.writer().write(dest, content);
    if (~dest.indexOf('/src/')) {
      part = dest.split('/src/')[1];
    } else if (~dest.indexOf('\\src\\')) {
      part = dest.split('\\src\\')[1];
    }
    CONFIG["export"].push(part.replace(/\\/g, '/'));
    return dest;
  };


  /*
      2. 处理 .ver 删除
   */

  process_ver = function() {
    return spawn('svn', ['remove', "" + (FILE('.ver'))]);
  };


  /*
      3. 处理 build.sh 修改
   */

  process_build = function() {};


  /*
      4. 生成 fekit.config
   */

  process_config = function() {
    var str;
    str = JSON.stringify(CONFIG, null, 4);
    return new utils.file.writer().write(FILE("fekit.config"), str);
  };


  /*
      转换app
   */

  LINK_CSS_REG = /http:\/\/qunarzz.com\/(.*?)\/prd\/(.*?)-(.*?)\.css/ig;

  LINK_JS_REG = /http:\/\/qunarzz.com\/(.*?)\/prd\/(.*?)-(.*?)\.js/ig;

  get_config = function() {
    return new utils.file.reader().readJSON(FILE("_convert.json"));
  };

  _each_files = function(cb) {
    var config;
    config = get_config();
    return utils.path.each_directory(CURR, function(file) {
      var ext;
      if (~file.indexOf(".svn")) {
        return;
      }
      if (utils.path.is_directory(file)) {
        return;
      }
      ext = syspath.extname(file);
      if (!config.filter.length || (config.filter.length && ~config.filter.indexOf(ext))) {
        if (cb(file, config)) {
          return utils.logger.log("已处理 " + file);
        }
      }
    }, true);
  };

  _get_verpath = function(config, path, type, filepath) {
    var ext, ver;
    ext = syspath.extname(filepath);
    ver = syspath.join(config.ver_path, path + ("." + type + ".ver"));
    if (config.include_version_type[ext]) {
      return config.include_version_type[ext].replace("#ver#", ver);
    } else {
      throw "没有正确的 include_version_type 配置节点 , 当前处理文件是 " + filepath;
    }
  };

  _replaceCSS = function(filepath, config) {
    var content, m;
    content = new utils.file.reader().read(filepath);
    m = content.match(LINK_CSS_REG);
    if (!m || !m.length) {
      return false;
    }
    content = content.replace(LINK_CSS_REG, (function(_this) {
      return function(match, project_name, path, ver) {
        return "http://qunarzz.com/" + project_name + "/prd/" + path + "@" + (_get_verpath(config, path, "css", filepath)) + ".css";
      };
    })(this));
    new utils.file.writer().write(filepath, content);
    return true;
  };

  _replaceJS = function(filepath, config) {
    var content, m;
    content = new utils.file.reader().read(filepath);
    m = content.match(LINK_JS_REG);
    if (!m || !m.length) {
      return false;
    }
    content = content.replace(LINK_JS_REG, (function(_this) {
      return function(match, project_name, path, ver) {
        return "http://qunarzz.com/" + project_name + "/prd/" + path + "@" + (_get_verpath(config, path, "js", filepath)) + ".js";
      };
    })(this));
    new utils.file.writer().write(filepath, content);
    return true;
  };

  check_config = function() {
    return utils.path.exists(FILE("_convert.json"));
  };

  show_config = function() {
    var str;
    str = "请按以下格式在项目根目录下建立 _convert.json 文件 , 此配置只符合一般项目使用 , 如果项目中的引用方式不一致 , 需要自行修改\n\n{\n    // ver目录的路径, 这个路径会影响include version文件\n    \"ver_path\" : \"/ver/\" ,   \n    // 搜索文件类型, 如果不指定则默认搜索所有文件\n    \"filter\" : [ \".jsp\" , \".htm\" ] ,\n    // 引用版本号文件的方式. 使用#ver#代替路径描述\n    \"include_version_type\" : {  \n        \".jsp\" : \"<jsp:include page=\\\"#ver#\\\" flush=\\\"true\\\"/>\" , \n        \".htm\" : \"<!--#include file=\\\"#ver#\\\" -->\" \n    }\n}\n";
    utils.logger.error("没有转换应用的配置文件.");
    return utils.logger.error(str);
  };

  process_app_css = function() {
    return _each_files(_replaceCSS);
  };

  process_app_javascript = function() {
    return _each_files(_replaceJS);
  };


  /*
      恢复原状
      svn revert . -R && svn st | awk '{print $2}' | xargs rm
   */

  exports.run = function(options) {
    CURR = options.cwd;
    if (options.qzz) {
      if (!check()) {
        utils.logger.error("当前目录不符合转换规则, 禁止转换");
        return;
      }
      process_srclist();
      process_ver();
      process_build();
      process_config();
      return utils.logger.log("转换完成.");
    } else if (options.app) {
      if (!check_config()) {
        return show_config();
      } else {
        process_app_css();
        process_app_javascript();
        return utils.logger.log("转换完成.");
      }
    } else {
      return utils.logger.error("必须使用 --qzz 或 --app 来确定转换的目录类型, 使用 fekit convert --help 来查看帮助. ");
    }
  };

}).call(this);
