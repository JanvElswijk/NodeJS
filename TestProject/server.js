const express = require('express')
const app = express()
const port = 3000

const birds = require('./birds')
const user = require('./user')
const book = require('./book')

app.route('/')
  .all((req, res, next) => {
    console.log('oh shit')
    next()
  })
  .get((req, res) => {
    res.send('Hello World!')
    console.log('Hello World!')
  })
  .post((req, res) => {
    res.send('Got a POST request')
    console.log('Got a POST request')
  })
  .put((req, res) => {
    res.send('Got a PUT request')
    console.log('Got a PUT request')
  })
  
app.use('/user', user)
app.use('/birds', birds)
app.use('/book', book)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})