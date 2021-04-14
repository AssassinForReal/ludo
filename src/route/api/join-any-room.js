const server = require('../../server')
const { error, success } = require('../utils')

module.exports = router => {
  router.get('/join-any-room', (req, res) => {
    const player = server.getPlayerBySecretId(req.cookies.secretId)
  
    if (!player) 
      return error(res, 'Player not logged in')

    let roomToJoin = null

    for (const room of server.rooms) {
      if (room.canJoin() && !room.private) {
        roomToJoin = room
      }
    }

    if (!roomToJoin) {
      roomToJoin = server.newRoom()
    }

    server.joinRoom(roomToJoin, player)

    if (roomToJoin.players.length === roomToJoin.slots) {
      roomToJoin.startGame()
    }
    return success(res, { room: roomToJoin.toNetworkObject() })
  })
}
