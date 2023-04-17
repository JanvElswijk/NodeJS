const express = require('express')
const router = express.Router()

router.route('/')
  .all((req, res, next) => {
    console.log('oh shit user edition')
    next()
  })
  .put((req, res) => {
    res.send('Got a PUT request at /user')
    console.log('Got a PUT request at /user')
  })
  .delete((req, res) => {
    res.send('Got a DELETE request at /user')
    console.log('Got a DELETE request at /user');
  })

  module.exports = router