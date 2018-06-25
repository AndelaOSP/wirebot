require('dotenv').load()

const express = require('express')
const http = require('http')
const helmet = require('helmet')
const bodyParser = require('body-parser')

const isDevMode = process.NODE_ENV === 'development'
const slackIM = require('./modules/slack/interactive_messages')
const logger = require('./logs')
const {
  loggingMiddleware,
  setHeadersMiddleware,
  verifySlackTokenMiddleware,
  slackReportMiddleware,
  botHomeMiddleware,
  errorFourZeroFourMiddleware,
  httpErrorMiddleware
} = require('./modules/middlewares')

const app = express()
const server = http.createServer(app)
const slackImMiddleware = slackIM.expressMiddleware()
const PORT = isDevMode ? 3000 : (process.env.PORT || 3000)

/**
* Event listener for HTTP server "listening" event.
 *
 * @param {Object} server the http server instance
 *
 * @returns {null} server process is continous here, so no returns
 */
function onListening (server) {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  logger.info(`🚧 Wirebot is Listening on ${bind}`)
}

/**
 * Event listener for HTTP server "error" event.
 * @param {Error} error an error message
 * @returns {null} error already logged exits process
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  switch (error.code) {
    case 'EACCES':
      logger.error('port requires elevated privileges')
      return process.exit(1)
    case 'EADDRINUSE':
      logger.error('port is already in use')
      return process.exit(1)
    default:
      return logger.error(error.message)
  }
}

app.options(setHeadersMiddleware)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet())
app.use(loggingMiddleware)
app.get('/', botHomeMiddleware)
app.post('/slack/actions', verifySlackTokenMiddleware, slackImMiddleware)
app.post('/slack/report', verifySlackTokenMiddleware, slackReportMiddleware)
app.use(errorFourZeroFourMiddleware)
app.use(httpErrorMiddleware)

// Only run this section if file is loaded directly (eg `node wirebot.js`)
// module loaded by something else eg. test or cyclic dependency
// Fixes error: "Trying to open unclosed connection."
if (require.main === module) {
  server.listen(PORT)
  server.on('listening', onListening.bind(null, server)).on('error', onError)
}

module.exports = { app, onError, onListening, isDevMode }
