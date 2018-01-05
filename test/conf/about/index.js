var Path = require('path')
var core = require('../../../lib/index')

console.dir(core.getGlobalData())

module.exports = function(opts){
  return {
    "__root": "layout.mustache?title=About",
    "__nav": "common/nav.mustache?menus=menus.js",
    "__content": "content/about.mustache",
    "boxs": function(){
      return [{
        __root: 'common/box.mustache',
        boxContent: '1'
      }, {
        __root: 'common/box.mustache',
        boxContent: '2'
      }].map(function(config){
        return core.output(config, opts)
      })
    }
  }
}
