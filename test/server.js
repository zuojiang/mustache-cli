import express from 'express'

// import {renderFile} from '../src/express'
import {renderFile} from '../lib/express'
import data1 from './conf/index.json'
import data2 from './conf/about/index.js'

const app = express()
const opts = {
  baseDir: 'test',
}

app.set('views', 'test/tpl')
app.set('view engine', 'mustache')
app.engine('mustache', renderFile(opts))

app.use('/index.htm', (req, res) => {
  res.render('content/home', data1)
})

app.use('/about/index.htm', (req, res) => {
  res.render('content/about', data2(opts))
})

app.use((req, res) => {
  res.render('layout', {
    title: '404'
  })
})

app.listen(3000)
