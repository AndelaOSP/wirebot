const glob = require('glob')
const path = require('path')
const sinon = require('sinon')

const logger = require('../logs')

const specFiles = glob.sync('*.spec.js', {
  cwd: path.resolve(__dirname), matchBase: true, ignore: ['helpers/**']
})

before(() => {
  sinon.spy(logger, 'info')
  sinon.spy(logger, 'error')
})

after(async () => {
  logger.info.restore()
  logger.error.restore()
})

specFiles.map(file => require(`./${file}`))
