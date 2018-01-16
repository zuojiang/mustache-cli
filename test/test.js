import { output, setGlobalData } from '../lib/index'

let data = {
  debug: true,
}

setGlobalData(data)

output({
  baseDir: './test',
  minify: true,
  pretty: true,
  // watch: true,
  // color: true,
  print: console.log,
  onError: console.error,
  variables: data,
  ext: 'htm',
})
