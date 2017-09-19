import express from 'express'

// import {renderFile} from '../src/express'
import {renderFile} from '../lib/express'
import data1 from './conf/index.json'
import data2 from './conf/about/index.js'

const app = express()

app.set('views', 'test/tpl')
app.set('view engine', 'mustache')
app.engine('mustache', renderFile({
  baseDir: 'test',
}))

app.use('/index.html', (req, res) => {
  res.render('content/home', data1)
})

app.use('/about/index.html', (req, res) => {
  res.render('content/about', data2)
})

app.use((req, res) => {
  res.render('layout', {
    title: 'success'
  })
})

app.listen(3000)
