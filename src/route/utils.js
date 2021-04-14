const { Response } = require('express')

const cookieOptions = {
  // 1 day
  maxAge: 1000 * 60 * 60 * 24
}

/**
 * @param {Response} res 
 */
function error(res, message = undefined) {
  return res.json({
    result: 'error', message
  })
}

/**
 * @param {Response} res 
 */
function success(res, data = {}) {
  return res.json({
    result: 'success', ...data
  })
}

/**
 * @param {Response} res 
 * @param {string} secretId
 */
function cookieId(res, secretId) {
  res.cookie('secretId', secretId, cookieOptions)
}

module.exports = { error, success, cookieId }
