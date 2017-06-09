var Path = require('path')
var output = require('../../../lib/index').default

module.exports = {
  "__root": "layout.tpl?title=About",
  "__nav": "common/nav.tpl?menus=menus.js",
  "__content": "content/about.tpl",
  "boxs": function(){
    return [{
      __root: 'common/box.tpl',
      boxContent: '1'
    }, {
      __root: 'common/box.tpl',
      boxContent: '2'
    }].map(config => output({
      baseDir: Path.resolve(__dirname, '../../'),
      config,
    }))
  }
}
