'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
        var html = (0, _index.output)(_extends({}, options, {
          config: data
        }));
        next(null, html);
      } catch (e) {
        next(e);
      }
    });
  };
}