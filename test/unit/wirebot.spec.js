const logger = require('../../logs')
const { server, onError } = require('../../wirebot')

const {
  expect, serverError
} = require('../helpers')

describe('Wirebot', () => {
  before(async () => {
    await server.listen(3000)
  })

  after(async () => {
    await server.close()
  })

  describe('- Server', () => {
    it('should be started', () => {
      expect(logger.info.calledWith(`🚧 Wirebot is Listening on port ${3000}`))
        .to.equal(true)
    })
  })

  describe('- onError', () => {
    it('should log an error', () => {
      onError(serverError('listen', 'EACCES'))
      expect(logger.error.calledWith('port requires elevated privileges'))
        .to.equal(true)
      onError(serverError('listen', 'EADDRINUSE'))
      expect(logger.error.calledWith('port is already in use'))
        .to.equal(true)
      onError(serverError('listen'))
      expect(logger.error.called).to.equal(true)
      onError(serverError('some-error-type'))
      expect(logger.error.called).to.equal(true)
    })
  })
})
