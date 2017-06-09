var Path = require('path')

var menus = [
  {
    "title": "Home",
    "url": "index.html"
  },
  {
    "title": "About",
    "url": "about/index.html"
  }
]

module.exports = function(){
  var baseUrl = '.'
  if (this.title === 'About') {
    baseUrl = '..'
  }
  return menus.map(function(menu){
    return {
      title: menu.title,
      url: Path.join(baseUrl, menu.url),
    }
  })
}
