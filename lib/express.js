'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderFile = renderFile;

var _index = require('./index');

function renderFile() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$rootTpl = options.rootTpl,
      rootTpl = _options$rootTpl === undefined ? '__root' : _options$rootTpl;


  return function (path, data, next) {

    return new Promise(function (resolve, reject) {
      next = next || function (err, html) {
        if (err) {
          return reject(err);
        }
        resolve(html);
      };

      if (!data[rootTpl]) {
        data[rootTpl] = path;
      }

      try {
        var html = (0, _index.output)(data, options);
        next(null, html);
      } catch (e) {
        next(e);
      }
    });
  };
}