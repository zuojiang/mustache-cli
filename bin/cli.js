#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _stdin = require('stdin');

var _stdin2 = _interopRequireDefault(_stdin);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _index = require('../lib/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();

_commander2.default.name('mustache');
_commander2.default.version('\n  mustache version: ' + require('mustache/package.json').version + '\n  mustache-cli version: ' + require('../package.json').version + '\n');
_commander2.default.usage('[options] [dir]');
_commander2.default.option('-h, --help', 'output usage information');
_commander2.default.option('-m, --minify', 'compile minify HTML output');
_commander2.default.option('-p, --pretty', 'compile pretty HTML output');
_commander2.default.option('-s, --silent', 'do not output logs');
_commander2.default.option('-w, --watch', 'watch files');
_commander2.default.option('-c, --conf-dir <dir>', 'the config file directory (*.js or *.json, Default: ./conf)');
_commander2.default.option('-t, --tpl-dir <dir>', 'template file directory (Default: ./tpl)');
_commander2.default.option('-o, --out-dir <dir>', 'output the rendered HTML or compiled JavaScript to <dir> (Default: ./out)');
_commander2.default.option('-e, --extension <ext>', 'specify the output file extension (Default: html)');
_commander2.default.option('-C, --conf <path>', 'the config file (*.js or *.json)');
_commander2.default.option('-O, --out <path>', 'the rendered HTML file (*.html)');
_commander2.default.option('--pipe', 'enables pipeline mode');
_commander2.default.option('--color', 'enables colors on the console');
_commander2.default.option('--root-tpl <str>', 'as an entry to compile (Default: __root)');
_commander2.default.option('--tpl-prefix <str>', 'as a loading partial from a tpl file (Default: __)');
_commander2.default.option('--partial-prefix <str>', 'as a string partial (e.g. {{>partial}}, Default: _)');
_commander2.default.option('--global-data <path>', 'the file as global data to compile (*.js or *.json)');
_commander2.default.parse(process.argv);
_commander2.default.on('--help', function () {
  console.log('\nExamples:\n\n   mastche --color ./\n   mastche -C data.json -O index.html ./src\n   cat data.json | mastche --pipe > index.html\n   ');
});

if (_commander2.default.help) {
  var data = _commander2.default.globalData ? require(_path2.default.join(cwd, _commander2.default.globalData)) : null;
  (0, _index.setGlobalData)(data);
  var opts = {
    confDir: _commander2.default.confDir,
    tplDir: _commander2.default.tplDir,
    outDir: _commander2.default.outDir,
    rootTpl: _commander2.default.rootTpl,
    tplPrefix: _commander2.default.tplPrefix,
    partialPrefix: _commander2.default.partialPrefix,
    print: _commander2.default.silent ? function () {} : console.log,
    onError: _commander2.default.silent ? function () {} : console.error,
    minify: _commander2.default.minify,
    pretty: _commander2.default.pretty,
    watch: _commander2.default.watch,
    color: _commander2.default.color,
    ext: _commander2.default.extension,
    variables: data
  };

  if (_commander2.default.conf) {
    (function () {
      var config = require(_path2.default.resolve(_commander2.default.conf));
      var text = (0, _index.output)(_extends({}, opts, {
        baseDir: _commander2.default.args[0],
        watch: false,
        color: false,
        config: config
      }));
      if (_commander2.default.out) {
        var outFile = _path2.default.resolve(_commander2.default.out);
        _mkdirp2.default.sync(_path2.default.dirname(outFile));
        _fs2.default.writeFileSync(outFile, text);
        console.log(outFile);
      } else {
        console.log(text);
      }
    })();
  } else if (_commander2.default.pipe) {
    (0, _stdin2.default)(function (json) {
      var config = JSON.parse(json.toString());
      var text = (0, _index.output)(_extends({}, opts, {
        baseDir: _commander2.default.args[0],
        print: function print() {},
        onError: function onError(e) {
          process.stderr.write(e.toString());
        },
        watch: false,
        color: false,
        config: config
      }));
      process.stdout.write(text);
    });
  } else {
    for (var i = 0; i < _commander2.default.args.length; i++) {
      (0, _index.output)(_extends({}, opts, {
        baseDir: _commander2.default.args[i]
      }));
    }
  }
} else {
  _commander2.default.outputHelp();
}
