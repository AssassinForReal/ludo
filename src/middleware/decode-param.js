module.exports = (req, res, next) => {
  try {
    decodeURIComponent(req.path)
    next()
  } catch (err) {
    return res.status(400).send('400 Bad Request')
  }
}
