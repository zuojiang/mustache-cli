// const output = require('mustache-cli').output
const output = require('../../lib/index').output

module.exports = function(opts){
  return {
    __root: 'layout.mustache',
    _tpl: '{{{html}}}',
    title: 'Multi',
    html: function(){
      const page1 = output({
        __root: 'page.mustache',
        _content: '<p>page1</p>',
        title: this.title,
      }, opts)
      const page2 = output({
        __root: 'page.mustache',
        _content: '<p>page2</p>',
        title: this.title,
      }, opts)
      return page1 + page2
    }
  }
}
