const server = require('../../server')
const { success } = require('../utils')

module.exports = router => {
  router.get('/status', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    const result = {
      player: null,
      room: null
    }
  
    if (player) {
      const room = player.room
  
      result.player = player.toNetworkObject()
  
      if (room && !room.hasEnded()) {
        result.room = room.toNetworkObject()
      }
    }

    return success(res, result)
  })
}
