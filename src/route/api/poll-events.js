const server = require('../../server')
const { error, success } = require('../utils')

module.exports = router => {
  router.get('/poll-events', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player)
      return error(res, 'Player not logged in')

    success(res, { events: player.events })

    player.events.length = 0
  })
}
