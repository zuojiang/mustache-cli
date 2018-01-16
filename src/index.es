import fs from 'fs'
import Url from 'url'
import Path from 'path'
import mustache from 'mustache'
import Pretty from 'pretty'
import minifier from 'html-minifier'
import mkdirp from 'mkdirp'
import Watch from 'node-watch'
import clc from 'cli-color'
import lang from 'lodash/lang'

export default mustache

let _global = null

export function setGlobalData(data) {
  _global = data
}

export function getGlobalData() {
  return _global
}

export function output(config, opts) {
  let {
    baseDir = '.',
    confDir,
    tplDir,
    outDir,
    rootTpl = '__root',
    tplPrefix = '__',
    partialPrefix = '_',
    ext = 'html',
    render = ({
      tpl,
      data,
      partials
    }) => mustache.render(tpl, data, partials),
    print = msg => {},
    onError = e => {
      throw e
    },
    watch = false,
    color = false,
    minify = false,
    pretty = false,
    outFile = '__file',
    forceMinify = '__minify',
    forcePretty = '__pretty',
    config: _config,
  } = (opts || config)

  if (!opts) {
    config = _config
  }

  baseDir = Path.resolve(baseDir)
  confDir = confDir ? Path.resolve(confDir) : Path.join(baseDir, 'conf')
  tplDir = tplDir ? Path.resolve(tplDir) : Path.join(baseDir, 'tpl')
  outDir = outDir ? Path.resolve(outDir) : Path.join(baseDir, 'out')

  opts = {
    baseDir,
    confDir,
    tplDir,
    outDir,
    rootTpl,
    tplPrefix,
    partialPrefix,
    ext,
    render,
    onError,
    print,
    color,
    minify,
    pretty,
    outFile,
    forceMinify,
    forcePretty,
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
    filePath,
    text,
    bad,
  }, index) => writeHTML(path, text, {
    ...opts,
    index,
    bad,
  }))
}

function readData(opts) {
  const {
    confDir,
    outDir,
    outFile,
    onError,
    forceMinify,
    forcePretty,
  } = opts

  let configs = null
  try {
    configs = readFile(confDir, path => /\.(js|json)$/i.test(path), opts)
  } catch (e) {
    onError(e)
  }

  const list = []

  for (let path in configs) {
    let config = configs[path]
    try {
      let result = readTpl(config, opts)
      if (result) {
        let filePath = config[outFile]
        if (!filePath) {
          filePath = path
        } else if (!Path.isAbsolute(filePath)) {
          filePath = Path.join(outDir, filePath)
        }

        let _opts = {...opts}
        if (lang.isBoolean(config[forceMinify])) {
          _opts.minify = config[forceMinify]
        }
        if (lang.isBoolean(config[forcePretty])) {
          _opts.pretty = config[forcePretty]
        }
        list.push({
          path: filePath,
          text: compile(result, _opts),
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
    rootTpl,
    outFile,
    tplPrefix,
    partialPrefix,
    forceMinify,
    forcePretty,
  } = opts

  let data = {}

  let partials = {}

  let tpl = null

  for (let key in config) {
    if (key === forceMinify
     || key === forcePretty) {
      continue
    }
    if (outFile && key === outFile) {
      continue
    }

    let value = config[key]
    if (key === rootTpl) {
      let {
        pathname,
        query
      } = Url.parse(value, true)

      tpl = readPartial(pathname, opts)

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

      partials[partial] = readPartial(pathname, opts)

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
    render,
    minify,
    pretty,
  } = opts

  let text = render({
    tpl,
    data: {
      ..._global,
      ...data,
    },
    partials
  })

  if (minify) {
    text = minifier.minify(text, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      caseSensitive: true,
    })
  } else if (pretty) {
    text = Pretty(text)
  }
  return text
}

function writeHTML(filePath, text, opts) {
  const {
    confDir,
    outDir,
    print,
    color,
    index,
    bad,
    onError,
    ext,
  } = opts

  if (filePath.indexOf(confDir) === 0) {
    filePath = Path.join(outDir, filePath.substr(confDir.length))
    filePath = filePath.replace(/(js|json)$/ig, ext)
  }
  const dir = Path.dirname(filePath)
  let msg = `[${index + 1}] ${filePath}`
  try {
    mkdirp.sync(dir)
    fs.writeFileSync(filePath, text)
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
      data[key] = requireJS(Path.join(confDir, value), opts)
    } else {
      data[key] = value
    }
  }

  return data
}

function readFile(path, filter = () => true, opts) {
  const stats = fs.statSync(path)
  if (stats.isDirectory()) {
    const list = fs.readdirSync(path)
    let map = {}
    list.forEach(filename => {
      map = {
        ...map,
        ...readFile(Path.join(path, filename), filter, opts)
      }
    })
    return map
  } else if (stats.isFile() && filter(path)) {
    let content
    if (/\.(js|json)$/i.test(path)) {
      content = requireJS(path, opts)
    } else {
      content = fs.readFileSync(path).toString()
    }
    return {
      [path]: content,
    }
  }

  return {}
}


function requireJS(path, opts) {
  require.cache[path] = null
  const data = require(path)
  if (typeof data === 'function' && data.length > 0) {
    return data(opts)
  }
  return data
}

function readPartial(pathname, opts) {
  const {
    tplDir,
  } = opts

  if (/^\.{1,2}/.test(pathname)) {
    pathname = Path.resolve(pathname)
  } else if (!Path.isAbsolute(pathname)) {
    pathname = Path.join(tplDir, pathname)
  }

  return readFile(pathname, undefined, opts)[pathname]
}
