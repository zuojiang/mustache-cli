#!/usr/bin/env node

import Path from 'path'
import fs from 'fs'
import program from 'commander'
import stdin from 'stdin'
import mkdirp from 'mkdirp'
import clc from 'cli-color'
import pkg from '../package.json'
import {
  output,
  setGlobalData,
} from '../lib/index'

const cwd = process.cwd()

program.name(pkg.name)
program.version(`
  mustache version: ${require('mustache/package.json').version}
  ${pkg.name} version: ${pkg.version}
`)
program.usage('[options] [dir]')
program.option('-h, --help', 'output usage information')
program.option('-m, --minify', 'compile minify HTML output')
program.option('-p, --pretty', 'compile pretty HTML output')
program.option('-s, --silent', 'do not output logs')
program.option('-w, --watch', 'watch files')
program.option('-c, --conf-dir <dir>', 'the config file directory (*.js or *.json, Default: ./conf)')
program.option('-t, --tpl-dir <dir>', 'template file directory (Default: ./tpl)')
program.option('-o, --out-dir <dir>', 'output the rendered HTML or compiled JavaScript to <dir> (Default: ./out)')
program.option('-e, --extension <ext>', 'specify the output file extension (Default: html)')
program.option('-C, --conf <path>', 'the config file (*.js or *.json)')
program.option('-O, --out <path>', 'the rendered HTML file (*.html)')
program.option('--pipe', 'enables pipeline mode')
program.option('--color', 'enables colors on the console')
program.option('--root-tpl <str>', 'as an entry to compile (Default: __root)')
program.option('--tpl-prefix <str>', 'as a loading partial from a tpl file (Default: __)')
program.option('--partial-prefix <str>', 'as a string partial (e.g. {{>partial}}, Default: _)')
program.option('--global-data <path>', 'the file as global data to compile (*.js or *.json)')
program.parse(process.argv)
program.on('--help', function(){
  console.log(`\nExamples:\n

  # Default directory structure:
    src/
    ├── conf/*.js(on)
    ├── out/*.html
    └── tpl/*.tpl

  # Render all files:
  $ ${pkg.name} --color ./src

  # Render a single file:
  $ ${pkg.name} -C data.json -O index.html ./src

  # Pipe mode:
  $ cat data.json | ${pkg.name} --pipe ./src > index.html

  # Get more help:
    ${pkg.homepage}
`)
})

if (program.help) {
  if (program.globalData) {
    setGlobalData(require(Path.join(cwd, program.globalData)))
  }

  const opts = {
    confDir: program.confDir,
    tplDir: program.tplDir,
    outDir: program.outDir,
    rootTpl: program.rootTpl,
    tplPrefix: program.tplPrefix,
    partialPrefix: program.partialPrefix,
    print: program.silent ? function(){} : console.log,
    onError: program.silent ? function(){} : console.error,
    minify: program.minify,
    pretty: program.pretty,
    watch: program.watch,
    color: program.color,
    ext: program.extension,
  }

  if (program.conf) {
    (function(){
      const config = require(Path.resolve(program.conf))
      const text = output({
        ...opts,
        baseDir: program.args[0],
        watch: false,
        color: false,
        config,
      })
      if (program.out) {
        const outFile = Path.resolve(program.out)
        mkdirp.sync(Path.dirname(outFile))
        fs.writeFileSync(outFile, text)
        console.log(outFile)
      } else {
        process.stdout.write(text)
      }
    })()
  } else if (program.pipe) {
      stdin(function(json) {
        const config = JSON.parse(json.toString())
        const text = output({
          ...opts,
          baseDir: program.args[0],
          print(){},
          onError(e){
            process.stderr.write(e.toString())
          },
          watch: false,
          color: false,
          config,
        })
        process.stdout.write(text)
      })
  } else {
    for(let i=0; i<program.args.length; i++) {
      output({
        ...opts,
        baseDir: program.args[i],
      })
    }
  }
} else {
  program.outputHelp()
}
