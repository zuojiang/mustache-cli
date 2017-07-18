var Path = require('path')
var core = require('../../../lib/index')

console.dir(core.getGlobalData())

module.exports = {
  "__root": "layout.tpl?title=About",
  "__nav": "./test/tpl/common/nav.tpl?menus=menus.js",
  "__content": Path.join(__dirname, "../../tpl/content/about.tpl"),
  "boxs": function(){
    return [{
      __root: 'common/box.tpl',
      boxContent: '1'
    }, {
      __root: 'common/box.tpl',
      boxContent: '2'
    }].map(function(config){
      return core.output({
        baseDir: Path.resolve(__dirname, '../../'),
        config: config,
      })
  })
  }
}
