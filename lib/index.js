'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setGlobalData = setGlobalData;
exports.getGlobalData = getGlobalData;
exports.output = output;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _pretty = require('pretty');

var _pretty2 = _interopRequireDefault(_pretty);

var _htmlMinifier = require('html-minifier');

var _htmlMinifier2 = _interopRequireDefault(_htmlMinifier);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _nodeWatch = require('node-watch');

var _nodeWatch2 = _interopRequireDefault(_nodeWatch);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _lang = require('lodash/lang');

var _lang2 = _interopRequireDefault(_lang);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = _mustache2.default;


var _global = null;

function setGlobalData(data) {
  _global = data;
}

function getGlobalData() {
  return _global;
}

function output(config, opts) {
  var _ref = opts || config,
      _ref$baseDir = _ref.baseDir,
      baseDir = _ref$baseDir === undefined ? '.' : _ref$baseDir,
      confDir = _ref.confDir,
      tplDir = _ref.tplDir,
      outDir = _ref.outDir,
      _ref$rootTpl = _ref.rootTpl,
      rootTpl = _ref$rootTpl === undefined ? '__root' : _ref$rootTpl,
      _ref$tplPrefix = _ref.tplPrefix,
      tplPrefix = _ref$tplPrefix === undefined ? '__' : _ref$tplPrefix,
      _ref$partialPrefix = _ref.partialPrefix,
      partialPrefix = _ref$partialPrefix === undefined ? '_' : _ref$partialPrefix,
      _ref$ext = _ref.ext,
      ext = _ref$ext === undefined ? 'html' : _ref$ext,
      _ref$render = _ref.render,
      render = _ref$render === undefined ? function (_ref2) {
    var tpl = _ref2.tpl,
        data = _ref2.data,
        partials = _ref2.partials;
    return _mustache2.default.render(tpl, data, partials);
  } : _ref$render,
      _ref$print = _ref.print,
      print = _ref$print === undefined ? function (msg) {} : _ref$print,
      _ref$onError = _ref.onError,
      onError = _ref$onError === undefined ? function (e) {
    throw e;
  } : _ref$onError,
      _ref$watch = _ref.watch,
      watch = _ref$watch === undefined ? false : _ref$watch,
      _ref$color = _ref.color,
      color = _ref$color === undefined ? false : _ref$color,
      _ref$minify = _ref.minify,
      minify = _ref$minify === undefined ? false : _ref$minify,
      _ref$pretty = _ref.pretty,
      pretty = _ref$pretty === undefined ? false : _ref$pretty,
      _ref$outFile = _ref.outFile,
      outFile = _ref$outFile === undefined ? '__file' : _ref$outFile,
      _ref$forceMinify = _ref.forceMinify,
      forceMinify = _ref$forceMinify === undefined ? '__minify' : _ref$forceMinify,
      _ref$forcePretty = _ref.forcePretty,
      forcePretty = _ref$forcePretty === undefined ? '__pretty' : _ref$forcePretty,
      _config = _ref.config;

  if (!opts) {
    config = _config;
  }

  baseDir = _path2.default.resolve(baseDir);
  confDir = confDir ? _path2.default.resolve(confDir) : _path2.default.join(baseDir, 'conf');
  tplDir = tplDir ? _path2.default.resolve(tplDir) : _path2.default.join(baseDir, 'tpl');
  outDir = outDir ? _path2.default.resolve(outDir) : _path2.default.join(baseDir, 'out');

  opts = {
    baseDir: baseDir,
    confDir: confDir,
    tplDir: tplDir,
    outDir: outDir,
    rootTpl: rootTpl,
    tplPrefix: tplPrefix,
    partialPrefix: partialPrefix,
    ext: ext,
    render: render,
    onError: onError,
    print: print,
    color: color,
    minify: minify,
    pretty: pretty,
    outFile: outFile,
    forceMinify: forceMinify,
    forcePretty: forcePretty
  };

  if (config) {
    try {
      return compile(readTpl(config, opts), opts);
    } catch (e) {
      onError(e);
    }
    return '';
  }

  if (watch) {
    (0, _nodeWatch2.default)([confDir, tplDir], {
      recursive: true
    }, function (evt, name) {
      print('\nWaiting for file changes...\n');
      output(_extends({}, opts, {
        watch: false
      }));
    });
  }

  readData(opts).map(function (_ref3, index) {
    var path = _ref3.path,
        filePath = _ref3.filePath,
        text = _ref3.text,
        bad = _ref3.bad;
    return writeHTML(path, text, _extends({}, opts, {
      index: index,
      bad: bad
    }));
  });
}

function readData(opts) {
  var confDir = opts.confDir,
      outDir = opts.outDir,
      outFile = opts.outFile,
      onError = opts.onError,
      forceMinify = opts.forceMinify,
      forcePretty = opts.forcePretty;


  var configs = null;
  try {
    configs = readFile(confDir, function (path) {
      return (/\.(js|json)$/i.test(path)
      );
    }, opts);
  } catch (e) {
    onError(e);
  }

  var list = [];

  for (var path in configs) {
    var config = configs[path];
    try {
      var result = readTpl(config, opts);
      if (result) {
        var filePath = config[outFile];
        if (!filePath) {
          filePath = path;
        } else if (!_path2.default.isAbsolute(filePath)) {
          filePath = _path2.default.join(outDir, filePath);
        }

        var _opts = _extends({}, opts);
        if (_lang2.default.isBoolean(config[forceMinify])) {
          _opts.minify = config[forceMinify];
        }
        if (_lang2.default.isBoolean(config[forcePretty])) {
          _opts.pretty = config[forcePretty];
        }
        list.push({
          path: filePath,
          text: compile(result, _opts)
        });
      }
    } catch (e) {
      onError(e);
      list.push({
        path: path,
        bad: true
      });
    }
  }

  return list;
}

function readTpl(config, opts) {
  var rootTpl = opts.rootTpl,
      outFile = opts.outFile,
      tplPrefix = opts.tplPrefix,
      partialPrefix = opts.partialPrefix,
      forceMinify = opts.forceMinify,
      forcePretty = opts.forcePretty;


  var data = {};

  var partials = {};

  var tpl = null;

  for (var key in config) {
    if (key === forceMinify || key === forcePretty) {
      continue;
    }
    if (outFile && key === outFile) {
      continue;
    }

    var value = config[key];
    if (key === rootTpl) {
      var _Url$parse = _url2.default.parse(value, true),
          pathname = _Url$parse.pathname,
          query = _Url$parse.query;

      tpl = readPartial(pathname, opts);

      data = _extends({}, data, parseParams(query, opts));
    } else if (key.indexOf(tplPrefix) === 0) {
      var partial = key.substr(tplPrefix.length);

      var _Url$parse2 = _url2.default.parse(value, true),
          _pathname = _Url$parse2.pathname,
          _query = _Url$parse2.query;

      partials[partial] = readPartial(_pathname, opts);

      data = _extends({}, data, parseParams(_query, opts));
    } else if (key.indexOf(partialPrefix) === 0) {
      var _partial = key.substr(partialPrefix.length);
      partials[_partial] = value;
    } else {
      data[key] = value;
    }
  }

  if (tpl) {
    return {
      tpl: tpl,
      data: data,
      partials: partials
    };
  }

  return null;
}

function compile(_ref4, opts) {
  var tpl = _ref4.tpl,
      data = _ref4.data,
      partials = _ref4.partials;
  var render = opts.render,
      minify = opts.minify,
      pretty = opts.pretty;


  var text = render({
    tpl: tpl,
    data: _extends({}, _global, data),
    partials: partials
  });

  if (minify) {
    text = _htmlMinifier2.default.minify(text, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      caseSensitive: true
    });
  } else if (pretty) {
    text = (0, _pretty2.default)(text);
  }
  return text;
}

function writeHTML(filePath, text, opts) {
  var confDir = opts.confDir,
      outDir = opts.outDir,
      print = opts.print,
      color = opts.color,
      index = opts.index,
      bad = opts.bad,
      onError = opts.onError,
      ext = opts.ext;


  if (filePath.indexOf(confDir) === 0) {
    filePath = _path2.default.join(outDir, filePath.substr(confDir.length));
    filePath = filePath.replace(/(js|json)$/ig, ext);
  }
  var dir = _path2.default.dirname(filePath);
  var msg = '[' + (index + 1) + '] ' + filePath;
  try {
    _mkdirp2.default.sync(dir);
    _fs2.default.writeFileSync(filePath, text);
    if (color) {
      msg = _cliColor2.default.bold(msg);
      if (bad) {
        msg = _cliColor2.default.red(msg);
      } else {
        msg = _cliColor2.default.greenBright(msg);
      }
    }
    print(msg);
  } catch (e) {
    onError(e);
  }
}

function parseParams(query, opts) {
  var confDir = opts.confDir;


  var data = {};

  for (var key in query) {
    var value = query[key];
    if (/\.(js|json)$/i.test(value)) {
      data[key] = requireJS(_path2.default.join(confDir, value), opts);
    } else {
      data[key] = value;
    }
  }

  return data;
}

function readFile(path) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };
  var opts = arguments[2];

  var stats = _fs2.default.statSync(path);
  if (stats.isDirectory()) {
    var list = _fs2.default.readdirSync(path);
    var map = {};
    list.forEach(function (filename) {
      map = _extends({}, map, readFile(_path2.default.join(path, filename), filter, opts));
    });
    return map;
  } else if (stats.isFile() && filter(path)) {
    var content = void 0;
    if (/\.(js|json)$/i.test(path)) {
      content = requireJS(path, opts);
    } else {
      content = _fs2.default.readFileSync(path).toString();
    }
    return _defineProperty({}, path, content);
  }

  return {};
}

function requireJS(path, opts) {
  require.cache[path] = null;
  var data = require(path);
  if (typeof data === 'function' && data.length > 0) {
    return data(opts);
  }
  return data;
}

function readPartial(pathname, opts) {
  var tplDir = opts.tplDir;


  if (/^\.{1,2}/.test(pathname)) {
    pathname = _path2.default.resolve(pathname);
  } else if (!_path2.default.isAbsolute(pathname)) {
    pathname = _path2.default.join(tplDir, pathname);
  }

  return readFile(pathname, undefined, opts)[pathname];
}