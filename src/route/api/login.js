const { error, success, cookieId } = require('../utils')
const playerLogin = require('../player-login')

module.exports = router => {
  router.post('/login', (req, res) => {
    const { username } = req.body
    const result = playerLogin(req.cookies.secretId, username)

    if (result.error)
      return error(res, result.error)

    if (result.secretId)
      cookieId(res, result.secretId)

    return success(res)
  })
}
