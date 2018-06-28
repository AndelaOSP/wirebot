
const moment = require('moment')
const { expect, should } = require('chai')
const sandbox = require('sinon').createSandbox()
const { WebClient } = require('@slack/client')
const { server, onError } = require('../../wirebot')
const logger = require('../../logs')
const stubs = require('./stubs')

module.exports = {
  sandbox,
  expect,
  should: should(),
  moment,
  server,
  onError,
  logger,
  WebClient: new WebClient(),
  ...stubs
}
