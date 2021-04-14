const server = require('../server')

module.exports = (secretId, username) => {
  if (!username || username.length == 0)
    return { error: 'Username cannot be empty' }

  if (username.length > 16)
    return { error: 'Username cannot be longer than 16 characters' }

  let player = server.getPlayerBySecretId(secretId)

  const result = {}

  if (!player) {
    player = server.newPlayer()
    result.secretId = player.secretId
  }

  player.username = username
  result.player = player
  return result
}
