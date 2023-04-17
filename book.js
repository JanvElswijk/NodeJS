const express = require('express')
const router = express.Router()

router.route('/')
  .all((req, res, next) => {
    console.log('oh shit book edition')
    next()
  })
  .get((req, res) => {
    res.send('Get a random book')
  })
  .post((req, res) => {
    res.send('Add a book')
  })
  .put((req, res) => {
    res.send('Update the book')
  })

  module.exports = router