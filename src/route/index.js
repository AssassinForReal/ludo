const express = require('express')
const router = express.Router()
const apiRouter = require('./api')
const joinRouter = require('./join')

router.use('/api', apiRouter)
router.use(joinRouter)

module.exports = router
