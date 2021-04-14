const path = require('path')
const express = require('express')
const router = express.Router()
const server = require('../server')
const { cookieId } = require('./utils')
const playerLogin = require('./player-login')

router.route('/join/:roomId')
  .get((req, res) => {
    const { roomId } = req.params
    const room = server.getRoomById(roomId)

    if (!room || !room.canJoin())
      return res.redirect('/')

    const player = server.getPlayerBySecretId(req.cookies.secretId)

    if (player) {
      server.joinRoom(room, player)

      if (room.players.length === room.slots) {
        room.startGame()
      }

      return res.redirect('/')
    }

    return res.sendFile(path.join(__dirname, '../static/username.html'))
  })
  .post((req, res) => {
    const { roomId } = req.params
    const room = server.getRoomById(roomId)

    if (!room || !room.canJoin())
      return res.redirect('/')

    const { username } = req.body
    const result = playerLogin(req.cookies.secretId, username)

    if (result.error)
      return res.redirect('/')

    if (result.secretId)
      cookieId(res, result.secretId)

    server.joinRoom(room, result.player)
    
    if (room.players.length === room.slots) {
      room.startGame()
    }

    return res.redirect('/')
  })

module.exports = router
