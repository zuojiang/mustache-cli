'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

exports.default = output;
function output() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
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
      _ref$render = _ref.render,
      render = _ref$render === undefined ? function (_ref2) {
    var tpl = _ref2.tpl,
        data = _ref2.data,
        partials = _ref2.partials;
    return _mustache2.default.render(tpl, data, partials);
  } : _ref$render,
      _ref$print = _ref.print,
      print = _ref$print === undefined ? function (msg) {} : _ref$print,
      _ref$color = _ref.color,
      color = _ref$color === undefined ? false : _ref$color,
      _ref$minify = _ref.minify,
      minify = _ref$minify === undefined ? false : _ref$minify,
      _ref$watch = _ref.watch,
      watch = _ref$watch === undefined ? false : _ref$watch,
      config = _ref.config;

  baseDir = _path2.default.resolve(baseDir);
  confDir = resolve(baseDir, confDir, 'conf');
  tplDir = resolve(baseDir, tplDir, 'tpl');
  outDir = resolve(baseDir, outDir, 'out');

  var opts = {
    baseDir: baseDir,
    confDir: confDir,
    tplDir: tplDir,
    outDir: outDir,
    rootTpl: rootTpl,
    tplPrefix: tplPrefix,
    partialPrefix: partialPrefix,
    render: render,
    print: print,
    color: color,
    minify: minify
  };

  if (config) {
    return compile(readTpl(config, opts), opts);
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
        html = _ref3.html;
    return writeHTML(path, html, _extends({}, opts, {
      index: index
    }));
  });
}

function readData(opts) {
  var confDir = opts.confDir;


  var configs = readFile(confDir, function (path) {
    return (/\.(js|json)$/i.test(path)
    );
  });

  var list = [];

  for (var path in configs) {
    var result = readTpl(configs[path], opts);
    if (result) {
      list.push({
        path: path,
        html: compile(result, opts)
      });
    }
  }

  return list;
}

function readTpl(config, opts) {
  var tplDir = opts.tplDir,
      rootTpl = opts.rootTpl,
      tplPrefix = opts.tplPrefix,
      partialPrefix = opts.partialPrefix;


  var data = {};

  var partials = {};

  var tpl = null;

  for (var key in config) {
    var value = config[key];
    if (key === rootTpl) {
      var _Url$parse = _url2.default.parse(value, true),
          pathname = _Url$parse.pathname,
          query = _Url$parse.query;

      pathname = _path2.default.join(tplDir, pathname);
      tpl = readFile(pathname)[pathname];

      data = _extends({}, data, parseParams(query, opts));
    } else if (key.indexOf(tplPrefix) === 0) {
      var partial = key.substr(tplPrefix.length);

      var _Url$parse2 = _url2.default.parse(value, true),
          _pathname = _Url$parse2.pathname,
          _query = _Url$parse2.query;

      _pathname = _path2.default.join(tplDir, _pathname);
      partials[partial] = readFile(_pathname)[_pathname];

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
  var color = opts.color,
      render = opts.render,
      minify = opts.minify;


  var html = void 0;

  try {
    html = render({
      tpl: tpl,
      data: data,
      partials: partials
    });
  } catch (e) {
    console.error(e);
    return '';
  }

  if (minify) {
    html = _htmlMinifier2.default.minify(html, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      caseSensitive: true
    });
  } else {
    html = (0, _pretty2.default)(html);
  }

  return html;
}

function writeHTML(path, html, opts) {
  var confDir = opts.confDir,
      outDir = opts.outDir,
      print = opts.print,
      color = opts.color,
      index = opts.index;


  path = _path2.default.join(outDir, path.substr(confDir.length));
  var filePath = path.replace(/(js|json)$/ig, 'html');
  var dir = _path2.default.dirname(filePath);
  _mkdirp2.default.sync(dir);
  _fs2.default.writeFileSync(filePath, html);

  var msg = '[' + (index + 1) + '] ' + filePath;
  if (color) {
    msg = _cliColor2.default.greenBright(_cliColor2.default.bold(msg));
  }
  print(msg);
}

function parseParams(query, opts) {
  var confDir = opts.confDir;


  var data = {};

  for (var key in query) {
    var value = query[key];
    if (/\.(js|json)$/i.test(value)) {
      data[key] = requireJS(_path2.default.join(confDir, value));
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

  var stats = _fs2.default.statSync(path);

  if (stats.isDirectory()) {
    var list = _fs2.default.readdirSync(path);
    var map = {};
    list.forEach(function (filename) {
      map = _extends({}, map, readFile(_path2.default.join(path, filename), filter));
    });
    return map;
  } else if (stats.isFile() && filter(path)) {
    var content = void 0;
    if (/\.(js|json)$/i.test(path)) {
      content = requireJS(path);
    } else {
      content = _fs2.default.readFileSync(path).toString();
    }
    return _defineProperty({}, path, content);
  }

  return {};
}

function resolve(baseDir, dir, defaultValue) {
  if (dir) {
    return _path2.default.resolve(dir);
  } else {
    return _path2.default.join(baseDir, defaultValue);
  }
}

function requireJS(path) {
  require.cache[path] = null;
  try {
    return require(path);
  } catch (e) {
    console.error(e);
    return null;
  }
}