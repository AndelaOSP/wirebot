
const moment = require('moment')
const { expect, should } = require('chai')

const stubs = require('./stubs')

module.exports = {
  expect,
  should: should(),
  moment,
  ...stubs
}
