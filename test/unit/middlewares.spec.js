const request = require('supertest')
const { expect, server, sandbox } = require('../helpers')
const { slackReportMiddleware, verifySlackTokenMiddleware, setHeadersMiddleware } = require('../../modules/middlewares')

describe('Middlewares:', () => {
  describe('- setHeadersMiddleware: ', () => {
    it('returns 204 status code if successful', done => {
      const request = {
        headers: {
          origin: ''
        }
      }

      const status = sandbox.spy()

      const response = {
        header: function () {},
        status
      }

      setHeadersMiddleware(request, response)

      expect(status.calledOnce).to.be.equal(true)

      expect(status.firstCall.args[0]).to.be.equal(204)

      done()
    })
  })
  describe('- slackReportMiddleware: ', () => {
    it('respond with initiationMessage()', done => {
      const request = {
        body: {
          user_name: 'prof'
        }
      }

      const send = sandbox.spy()

      const response = {
        status: function () {
          return {
            send
          }
        }
      }

      slackReportMiddleware(request, response)

      expect(send.calledOnce).to.be.equal(true)

      done()
    })
  })

  describe('- verifySlackTokenMiddleware: ', () => {
    it('calls next() when done', done => {
      const request = {
        body: {
          token: 'test_token'
        }
      }

      const next = sandbox.spy()

      const response = {}

      verifySlackTokenMiddleware(request, response, next)

      expect(next.calledOnce).to.be.equal(true)

      done()
    })

    it('throws error if unauthorised request', done => {
      const request = {
        body: {
          token: 'test_token'
        }
      }

      const next = sandbox.spy()

      const response = {}

      verifySlackTokenMiddleware(request, response, next)

      expect(next.firstCall.args[0]).to.be.instanceOf(Error)

      done()
    })

    it('calls next() if slack token verified', done => {
      const request = {
        body: {
          token: 'test_token'
        }
      }

      process.env.SLACK_VERIFICATION_TOKEN = 'test_token'

      const next = sandbox.spy()

      const response = {}

      verifySlackTokenMiddleware(request, response, next)

      expect(next.firstCall.args[0]).to.be.equal(null)

      done()
    })
  })

  describe('- errorFourZeroFourMiddleware: ', () => {
    it('should return 404 when invalid url is requested', done => {
      const requestEndpoint = '/invalidUrl'

      request(server)
        .get(requestEndpoint)
        .expect(404)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.deep.equal({
            status: 404,
            error: 'Wirebot Route Does Not Exist'
          })

          done()
        })
    })
  })

  describe('- botHomeMiddleware: ', () => {
    it('should return welcome message', done => {
      const requestEndpoint = '/'

      request(server)
        .get(requestEndpoint)
        .expect(200)
        .end((err, res) => {
          if (err) throw err

          expect(res.body).to.deep.equal({
            status: 200,
            message: 'welcome to wirebot'
          })

          done()
        })
    })
  })
})
