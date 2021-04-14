const server = require('../../server')
const { error, success } = require('../utils')

module.exports = router => {
  router.get('/create-private-room', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player) 
      return error(res, 'Player not logged in')

    const newRoom = server.newRoom()
    newRoom.private = true

    server.joinRoom(newRoom, player)
    return success(res, { room: newRoom.toNetworkObject() })
  })
}
