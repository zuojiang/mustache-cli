#!/usr/bin/env node

import Path from 'path'
import fs from 'fs'
import program from 'commander'
import stdin from 'stdin'
import mkdirp from 'mkdirp'
import {
  output,
  setGlobalData,
} from '../lib/index'

const cwd = process.cwd()

program.name('mustache-cli')
program.version(`
  mustache version: ${require('mustache/package.json').version}
  mustache-cli version: ${require('../package.json').version}
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
   mastche --color ./
   mastche -C data.json -O index.html ./src
   cat data.json | mastche --pipe > index.html
   `)
})

if (program.help) {
  const data = program.globalData ? require(Path.join(cwd, program.globalData)) : null
  setGlobalData(data)
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
    variables: data,
  }

  if (program.conf) {
    (function(){
      const config = require(Path.resolve(program.conf))
      const text = output({
        ...opts,
        baseDir: program.args[0],
        watch: false,
        color: false,
        config: config,
      })
      if (program.out) {
        const outFile = Path.resolve(program.out)
        mkdirp.sync(Path.dirname(outFile))
        fs.writeFileSync(outFile, text)
        console.log(outFile)
      } else {
        console.log(text)
      }
    })()
  } else if (program.pipe) {
      stdin(function(json) {
        const config = JSON.parse(json.toString())
        const text = output({
          ...opts,
          baseDir: program.args[0],
          print: function(){},
          onError: function(e){
            process.stderr.write(e.toString())
          },
          watch: false,
          color: false,
          config: config,
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
