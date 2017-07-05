#!/usr/bin/env node

var Path = require('path')
var program = require('commander');
var stdin = require('stdin');
var pkg = require('../package.json');
var core = require('../lib/index');

var cwd = process.cwd()

program.name('mustache');
program.version(pkg.version);
program.usage('[options] [dir]')
program.option('-h, --help', 'output usage information');
program.option('-m, --minify', 'compile minify HTML output');
program.option('-s, --silent', 'do not output logs');
program.option('-w, --watch', 'watch files');
program.option('-c, --conf-dir <dir>', 'the config file directory (*.js or *.json, Default: ./conf)');
program.option('-t, --tpl-dir <dir>', 'template file directory (Default: ./tpl)');
program.option('-o, --out-dir <dir>', 'output the rendered HTML or compiled JavaScript to <dir> (Default: ./out)');
program.option('-e, --extension <ext>', 'specify the output file extension (Default: html)');
program.option('--pipe', 'enables pipeline mode');
program.option('--color', 'enables colors on the console');
program.option('--root-tpl <str>', 'as an entry to compile (Default: __root)');
program.option('--tpl-prefix <str>', 'as a loading partial from a tpl file (Default: __)');
program.option('--partial-prefix <str>', 'as a string partial (e.g. {{>partial}}, Default: _)');
program.option('--global-data <js|json>', 'the file as global data to compile');
program.parse(process.argv);
program.on('--help', function(){
  console.log('\nExamples:\n');
  console.log('   mastche --color ./');
  console.log('   cat data.json | mastche --pipe > index.html');
  console.log('');
});

if (program.help) {
  var data = program.globalData ? require(Path.join(cwd, program.globalData)) : null;
  core.setGlobalData(data)

  if (program.pipe) {
      stdin(function(json) {
        var config = JSON.parse(json.toString())
        var text = core.output({
          baseDir: program.args[0],
          confDir: program.confDir,
          tplDir: program.tplDir,
          outDir: program.outDir,
          rootTpl: program.rootTpl,
          tplPrefix: program.tplPrefix,
          partialPrefix: program.partialPrefix,
          print: function(){},
          onError: function(e){
            process.stderr.write(e.toString());
          },
          minify: program.minify,
          watch: false,
          color: false,
          ext: undefined,
          variables: data,
          config: config,
        })
        process.stdout.write(text)
      })
  } else {
    for(var i=0; i<program.args.length; i++) {
      core.output({
        baseDir: program.args[i],
        confDir: program.confDir,
        tplDir: program.tplDir,
        outDir: program.outDir,
        rootTpl: program.rootTpl,
        tplPrefix: program.tplPrefix,
        partialPrefix: program.partialPrefix,
        print: program.silent ? function(){} : console.log,
        onError: program.silent ? function(){} : console.error,
        minify: program.minify,
        watch: program.watch,
        color: program.color,
        ext: program.extension,
        variables: data,
      })
    }
  }
} else {
  program.outputHelp()
}
