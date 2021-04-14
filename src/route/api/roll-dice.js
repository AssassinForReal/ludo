const server = require('../../server')
const { success, error } = require('../utils')

module.exports = router => {
  router.get('/roll-dice', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player)
      return error(res, 'Player not logged in')

    const room = player.room

    if (!room)
      return error(res, 'Player not in game')

    if (!room.isInGame())
      return error(res, 'Game has not started')

    if (!room.currentPlayer || room.currentPlayer.id !== player.id || room.diceRolled)
      return error(res, 'Player not allowed')

    room.rollDice(parseInt(req.query.n))
    return success(res)
  })
}
