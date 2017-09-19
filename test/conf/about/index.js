var Path = require('path')
var core = require('../../../lib/index')

console.dir(core.getGlobalData())

module.exports = {
  "__root": "layout.mustache?title=About",
  "__nav": "./test/tpl/common/nav.mustache?menus=menus.js",
  "__content": Path.join(__dirname, "../../tpl/content/about.mustache"),
  "boxs": function(){
    return [{
      __root: 'common/box.mustache',
      boxContent: '1'
    }, {
      __root: 'common/box.mustache',
      boxContent: '2'
    }].map(function(config){
      return core.output({
        baseDir: Path.resolve(__dirname, '../../'),
        config: config,
      })
  })
  }
}
