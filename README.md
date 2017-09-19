## mustache-cli

### Description

Mustache's CLI interface.

### Usage
```sh
$ npm install mustache-cli --global
$ mustache-cli -h
```

_./tpl/layout.mustache_

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>{{title}}</title>
  </head>
  <body>
    <div>
      {{>tpl}}
    </div>
  </body>
</html>
```

_./tpl/page.mustache_

```html
<h1>{{title}}</h1>
{{>content}}
```

_./conf/index.json_
```json
{
    "__root": "layout.mustache",
    "__tpl": "page.mustache",
    "_content": "<strong>Hello World</strong>",
    "title": "Home"
}
```

_./conf/multi.js_
```js
const output = require('mustache-cli').output
module.exports = {
  __root: 'layout.mustache',
  _tpl: '{{{html}}}',
  title: 'Multi',
  html: function(){
    const page1 = output({
      config: {
        __root: 'page.mustache',
        _content: '<p>page1</p>',
        title: this.title,
      }
    })
    const page2 = output({
      config: {
        __root: 'page.mustache',
        _content: '<p>page2</p>',
        title: this.title,
      }
    })
    return page1 + page2
  }
}
```

_./out/index.html_
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Home</title>
  </head>
  <body>
    <div>
      <h1>Home</h1>
      <strong>Hello World</strong>
    </div>
  </body>
</html>
```


_./out/multi.html_
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Multi</title>
  </head>
  <body>
    <div>
      <h1>Multi</h1>
      <p>page1</p>
      <h1>Multi</h1>
      <p>page2</p>
    </div>
  </body>
</html>
```

### Node

```js
import express from 'express'
import {renderFile} from 'mustache-cli/lib/express'

const app = express()

app.set('views', 'src/mustache/tpl')
app.set('view engine', 'mustache')
app.engine('mustache', renderFile({
  baseDir: 'src/mustache',
}))

app.use((req, res) => {
  res.render('layout', {
    title: 'Home',
  })
})

app.listen(3000)
```

### License

MIT
