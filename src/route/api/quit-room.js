const server = require('../../server')
const { success, error } = require('../utils')

module.exports = router => {
  router.get('/quit-room', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player)
      return error(res, 'Player not logged in')

    server.quitRoom(player)
    return success(res)
  })
}
