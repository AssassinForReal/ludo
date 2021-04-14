const server = require('../../server')
const { success, error } = require('../utils')

module.exports = router => {
  router.post('/move-counter', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player)
      return error(res, 'Player not logged in')

    const room = player.room

    if (!room)
      return error(res, 'Player not in game')

    if (!room.isInGame())
      return error(res, 'Game has not started')

    if (!room.currentPlayer || room.currentPlayer.id !== player.id || !room.diceRolled)
      return error(res, 'Player not allowed')

    const { counterId } = req.body

    if (counterId === undefined)
      return error(res, 'Counter id not specified')

    if (!room.moveCounter(counterId))
      return error(res, 'Counter cannot move')

    return success(res)
  })
}
