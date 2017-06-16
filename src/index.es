import fs from 'fs'
import Url from 'url'
import Path from 'path'
import mustache from 'mustache'
import pretty from 'pretty'
import minifier from 'html-minifier'
import mkdirp from 'mkdirp'
import Watch from 'node-watch'
import clc from 'cli-color'

export default mustache

let _global = null

export function setGlobalData(data) {
  _global = data
}

export function getGlobalData() {
  return _global
}


export function output({
  baseDir = '.',
  confDir,
  tplDir,
  outDir,
  rootTpl = '__root',
  tplPrefix = '__',
  partialPrefix = '_',
  render = ({
    tpl,
    data,
    partials
  }) => mustache.render(tpl, data, partials),
  print = msg => {},
  onError = e => {
    throw e
  },
  color = false,
  minify = false,
  watch = false,
  config,
  variables,
} = {}) {

  baseDir = Path.resolve(baseDir)
  confDir = confDir ? Path.resolve(confDir) : Path.join(baseDir, 'conf')
  tplDir = tplDir ? Path.resolve(tplDir) : Path.join(baseDir, 'tpl')
  outDir = outDir ? Path.resolve(outDir) : Path.join(baseDir, 'out')

  const opts = {
    baseDir,
    confDir,
    tplDir,
    outDir,
    rootTpl,
    tplPrefix,
    partialPrefix,
    render,
    onError,
    print,
    color,
    minify,
    variables,
  }

  if (config) {
    try {
      return compile(readTpl(config, opts), opts)
    } catch (e) {
      onError(e)
    }
    return ''
  }

  if (watch) {
    Watch([confDir, tplDir], {
      recursive: true,
    }, (evt, name) => {
      print('\nWaiting for file changes...\n')
      output({
        ...opts,
        watch: false,
      })
    })
  }

  readData(opts).map(({
    path,
    html,
    bad,
  }, index) => writeHTML(path, html, {
    ...opts,
    index,
    bad,
  }))
}

function readData(opts) {
  const {
    confDir,
    onError,
  } = opts

  let configs = null
  try {
    configs = readFile(confDir, path => /\.(js|json)$/i.test(path))
  } catch (e) {
    onError(e)
  }

  const list = []

  for (let path in configs) {
    try {
      let result = readTpl(configs[path], opts)
      if (result) {
        list.push({
          path,
          html: compile(result, opts),
        })
      }
    } catch (e) {
      onError(e)
      list.push({
        path,
        bad: true,
      })
    }
  }

  return list
}

function readTpl(config, opts) {
  const {
    tplDir,
    rootTpl,
    tplPrefix,
    partialPrefix,
  } = opts

  let data = {}

  let partials = {}

  let tpl = null

  for (let key in config) {
    let value = config[key]
    if (key === rootTpl) {
      let {
        pathname,
        query
      } = Url.parse(value, true)
      pathname = Path.join(tplDir, pathname)
      tpl = readFile(pathname)[pathname]

      data = {
        ...data,
        ...parseParams(query, opts),
      }
    } else if (key.indexOf(tplPrefix) === 0) {
      let partial = key.substr(tplPrefix.length)

      let {
        pathname,
        query
      } = Url.parse(value, true)

      pathname = Path.join(tplDir, pathname)
      partials[partial] = readFile(pathname)[pathname]

      data = {
        ...data,
        ...parseParams(query, opts),
      }
    } else if (key.indexOf(partialPrefix) === 0) {
      let partial = key.substr(partialPrefix.length)
      partials[partial] = value
    } else {
      data[key] = value
    }
  }

  if (tpl) {
    return {
      tpl,
      data,
      partials,
    }
  }

  return null
}

function compile({
  tpl,
  data,
  partials
}, opts) {
  const {
    color,
    render,
    minify,
    variables,
  } = opts

  let html

  html = render({
    tpl,
    data: {
      ...variables,
      ...data,
    },
    partials
  })

  if (minify) {
    html = minifier.minify(html, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      caseSensitive: true,
    })
  } else {
    html = pretty(html)
  }

  return html
}

function writeHTML(path, html, opts) {
  const {
    confDir,
    outDir,
    print,
    color,
    index,
    bad,
    onError,
  } = opts

  path = Path.join(outDir, path.substr(confDir.length))
  const filePath = path.replace(/(js|json)$/ig, 'html')
  const dir = Path.dirname(filePath)
  let msg = `[${index + 1}] ${filePath}`
  try {
    mkdirp.sync(dir)
    fs.writeFileSync(filePath, html)
    if (color) {
      msg = clc.bold(msg)
      if (bad) {
        msg = clc.red(msg)
      } else {
        msg = clc.greenBright(msg)
      }
    }
    print(msg)
  } catch (e) {
    onError(e)
  }
}

function parseParams(query, opts) {
  const {
    confDir
  } = opts

  const data = {}

  for (let key in query) {
    let value = query[key]
    if (/\.(js|json)$/i.test(value)) {
      data[key] = requireJS(Path.join(confDir, value))
    } else {
      data[key] = value
    }
  }

  return data
}

function readFile(path, filter = () => true) {
  const stats = fs.statSync(path)
  if (stats.isDirectory()) {
    const list = fs.readdirSync(path)
    let map = {}
    list.forEach(filename => {
      map = {
        ...map,
        ...readFile(Path.join(path, filename), filter)
      }
    })
    return map
  } else if (stats.isFile() && filter(path)) {
    let content
    if (/\.(js|json)$/i.test(path)) {
      content = requireJS(path)
    } else {
      content = fs.readFileSync(path).toString()
    }
    return {
      [path]: content,
    }
  }

  return {}
}


function requireJS(path) {
  require.cache[path] = null
  return require(path)
}
