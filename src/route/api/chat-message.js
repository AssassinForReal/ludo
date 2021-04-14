const Encoding = require('../../server/encoding')
const server = require('../../server')
const { error, success } = require('../utils')

module.exports = router => {
  router.post('/chat-message', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)

    if (!player)
      return error(res, 'Player not logged in')

    const room = player.room

    if (!room) 
      return error(res, 'Player not in game')

    const { message } = req.body

    if (!message)
      return error(res, 'Empty message')

    if (message.length > 256) {
      player.queueEvent({
        name: 'chat-message',
        'message': '<span style="color: red">Message cannot be longer than 256 characters</span>'
      })
      return error(res, 'Message cannot be longer than 256 characters')
    }

    const encMessage = Encoding.htmlSpecialChars(message)
    const encUsername = Encoding.htmlSpecialChars(player.username)
    const color = player.color ? player.color.value : '#777'

    room.broadcastMessage(`<span style="color: ${color}">${encUsername}</span>: ${encMessage}`)
    return success(res)
  })
}
