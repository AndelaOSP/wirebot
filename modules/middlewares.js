const morgan = require('morgan')

const logger = require('../logs')
const { initiationMessage } = require('./slack/messages')
const { logServiceError } = require('./utils')

const { ALLOWED_ORIGINS, API_URL, APP_URL } = process.env

/**
 * Wirebots Request Logging Middlware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 *
 * @returns {Object} the next middleware function
 */
function loggingMiddleware (req, res, next) {
  return morgan('combined', {
    immediate: true, stream: { write: msg => logger.info(msg.trim()) }
  })(req, res, next)
}

/**
 * Set Wirebots Http Headers Middlware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 *
 * @returns {Object} the next middleware function
 */
function setHeadersMiddleware (req, res) {
  const allowedOrigins = [ALLOWED_ORIGINS.split(','), API_URL, APP_URL]
  const allowedOrigin = allowedOrigins.includes(req.headers.origin)
  const headers1 = 'Origin, X-Requested-With, Content-Type, Accept'
  const headers2 = ',Authorization, Access-Control-Allow-Credentials'
  if (ALLOWED_ORIGINS) res.header('Access-Control-Allow-Origin', allowedOrigin)
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  res.header('Access-Control-Allow-Headers', `${headers1} ${headers2}`)
  res.header('Access-Control-Allow-Credentials', 'true')

  return res.status(200)
}

/**
 * 404 Error Middlware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 *
 * @returns {Object} the next middleware function
 */
function errorFourZeroFourMiddleware (req, res, next) {
  const error = new Error('Wirebot Route Does Not Exist')
  error.status = 404

  return next(error)
}

/**
 * Express Error Middleware
 *
 * @param {Object} error the error object
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 *
 * @returns {Object} the error in json
 */
function httpErrorMiddleware (error, req, res, next) {
  const { status = 500, message } = error
  error.response = {
    status,
    request: {
      ...req,
      path: req.path,
      agent: { protocol: req.protocol },
      res: {
        httpVersion: req.httpVersion,
        headers: { date: req._startTime },
        client: { servername: req.hostname }
      }
    }
  }
  logServiceError(error)

  return res.status(status).json({ status, error: message })
}

/**
 * Wirebot Home Middleware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 *
 * @returns {Object} the http json response
 */
function botHomeMiddleware (req, res) {
  return res.status(200).json({ status: 200, message: 'welcome to wirebot' })
}

/**
 * Slack Report Slash Command Middleware
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 *
 * @returns {Promise} the result
 */
function slackReportMiddleware (req, res) {
  const { user_name: userName } = req.body // eslint-disable-line camel-case

  return res.status(200).send(initiationMessage(`Hello ${userName} :smiley:`))
}

/**
 * Verify Slack Token Middleware
 *
 * @param {Object} req the http request object
 * @param {Object} res the http response object
 * @param {Function} next the next middleware function
 *
 * @returns {Promise} the result
 */
function verifySlackTokenMiddleware (req, res, next) {
  const payload = req.body.payload ? JSON.parse(req.body.payload) : req.body
  const { token } = payload
  const invalidToken = token !== process.env.SLACK_VERIFICATION_TOKEN
  const error = invalidToken ? new Error('Un-authorized request') : null
  if (error) error.status = 401

  return next(error)
}

module.exports = {
  botHomeMiddleware,
  setHeadersMiddleware,
  errorFourZeroFourMiddleware,
  verifySlackTokenMiddleware,
  httpErrorMiddleware,
  slackReportMiddleware,
  loggingMiddleware
}
