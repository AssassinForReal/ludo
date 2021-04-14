const express = require('express')
const cookieParser = require('cookie-parser')
const decodeParam = require('./middleware/decode-param')
const router = require('./route')

const port = process.env.PORT || 3000
const app = express()

app.use(decodeParam)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(router)
app.use(express.static('src/static'))

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
