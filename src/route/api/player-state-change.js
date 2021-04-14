const server = require('../../server')
const { success } = require('../utils')

module.exports = router => {
  router.post('/player-state-change', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player)
      return error(res, 'Player not logged in')

    if (!player.room)
      return error(res, 'Player not in game')

    if (!player.room.isWaiting() && !player.room.isCountingDown())
      return error(res, 'Cannot lock in')

    const { action } = req.body

    if (!action) 
      return error(res, 'Invalid action')

    switch (action) {
      case 'lock-in': {
        player.ready = true
        player.room.dispatchEvent({
          name: 'player-lock-in',
          player: player.toNetworkObject(),
          room: player.room.toNetworkObject()
        })

        const shouldStart = player.room.players.every(p => p.ready) && player.room.players.length > 1

        if (shouldStart) {
          player.room.startGame()
        }
        break
      }
      case 'lock-out': {
        player.ready = false
        player.room.dispatchEvent({
          name: 'player-lock-out',
          player: player.toNetworkObject(),
          room: player.room.toNetworkObject()
        })
        break
      }
      default:
        return error(res, 'Invalid action')
    }
    return success(res)
  })
}
