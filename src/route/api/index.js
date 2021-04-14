const express = require('express')
const fs = require('fs')
const router = express.Router()

fs.readdirSync(__dirname)
  .filter(route => route !== 'index.js')
  .forEach(route => {
    const init = require('./' + route)
    init(router)
  })

module.exports = router
