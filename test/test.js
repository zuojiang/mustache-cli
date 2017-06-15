// import output from '../lib/index'
import output from '../src/index'

output({
  baseDir: './test',
  // minify: true,
  watch: true,
  color: true,
  print: console.log,
  variables: {
    debug: true,
  }
})
