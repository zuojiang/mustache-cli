#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var output = require('../lib/index').default;

program.version(pkg.version);
program.option('-h, --help', 'output usage information');
program.option('-m, --minify', 'compile minify HTML output');
program.option('-s, --silent', 'do not output logs');
program.option('-w, --watch', 'watch files');
program.option('-c, --conf-dir <dir>', 'the config file directory (*.js or *.json, Default: ./conf)');
program.option('-t, --tpl-dir <dir>', 'template file directory (Default: ./tpl)');
program.option('-o, --out-dir <dir>', 'output the rendered HTML or compiled JavaScript to <dir> (Default: ./out)');
program.option('--color', 'Enables colors on the console');
program.option('--root-tpl <str>', 'as an entry to compile (Default: __root)');
program.option('--tpl-prefix <str>', 'as a loading partial from a tpl file (Default: __)');
program.option('--partial-prefix <str>', 'as a string partial (e.g. {{>partial}}), Default: _');
program.parse(process.argv);

if (program.help) {
  for(var i=0; i<program.args.length; i++) {
    output({
      baseDir: program.args[i],
      print: program.silent ? undefined : console.log,
      minify: program.minify,
      watch: program.watch,
      confDir: program.confDir,
      tplDir: program.tplDir,
      outDir: program.outDir,
      rootTpl: program.rootTpl,
      tplPrefix: program.tplPrefix,
      partialPrefix: program.partialPrefix,
      color: program.color,
    })
  }
} else {
  program.outputHelp()
}
