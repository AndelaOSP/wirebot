const { expect, slackUser, errorStub, logger } = require('../helpers')
const {
  logServiceError,
  getAndelaOffice,
  getSlackUserLocation,
  formatUserData,
  validateDate,
  validateLocation
} = require('../../modules/utils')

describe('Utils:', () => {
  describe('- logServiceError:', () => {
    // @TODO test should be refactored to use callee return values
    it('should call the winston error logger function', () => {
      const error = { ...new Error('message'), ...errorStub }
      logServiceError(error)
      expect(logger.error.called).to.equal(true)
      delete error.response
      logServiceError(error)
      expect(logger.error.called).to.equal(true)
      process.env.NODE_ENV = 'development'
      logServiceError(error)
      expect(logger.error.called).to.equal(true)
      process.env.NODE_ENV = 'test'
    })
  })

  describe('- getAndelaOffice:', () => {
    it('should return name, centre and country of Andela location', () => {
      expect(getAndelaOffice('kenya')).to.deep.equal({
        name: 'office', centre: 'ST. Catherines', country: 'kenya'
      })
    })

    it('should not be case sensitive', () => {
      expect(getAndelaOffice('Kenya')).to.deep.equal({
        name: 'office', centre: 'ST. Catherines', country: 'Kenya'
      })
    })

    it('should accept only Nigeria|Kenya|USA|Uganda country arguments', () => {
      expect(getAndelaOffice.bind(null, 'Lagos')).to
        .throw('country should be Nigeria, Kenya, Uganda or USA')
    })
  })

  describe('- getSlackUserLocation', () => {
    it('should get user location from slack user timezone', () => {
      expect(getSlackUserLocation('Africa/Algiers')).to.deep.equal({
        name: 'office', centre: 'EPIC Tower', country: 'Nigeria'
      })
    })

    it('should throw an error if timezone format is invalid', () => {
      expect(getSlackUserLocation.bind(null, 'Lagos')).to
        .throw('Invalid timezone')
    })
  })

  describe('- formatUserData:', () => {
    it('should return a user with reporterLocation', () => {
      expect(formatUserData(slackUser, 'Nigeria')).to
        .haveOwnProperty('reporterLocation')
    })

    it('should return a user with witnessLocation', () => {
      expect(formatUserData(slackUser)).to
        .haveOwnProperty('witnessLocation')
    })

    it('should throw an error for non string user id', () => {
      expect(formatUserData.bind(null, { ...slackUser, id: 2 })).to
        .throw('Invalid value 2')
    })

    it('should throw an error for non string user timezone', () => {
      expect(formatUserData.bind(null, { ...slackUser, tz: 2 })).to
        .throw('Invalid value 2')
    })

    it('should throw an error for non string p and c team', () => {
      expect(formatUserData.bind(null, slackUser, 2)).to
        .throw('Invalid value 2')
    })
  })

  describe('- validateDate', () => {
    it('should return true for date string args with format dd-mm-yyyy', () => {
      expect(validateDate('12-12-2017')).to.equal(true)
    })

    // @TODO write tests for future dates validation

    // it('should return false for invalid dates', () => {
    //   expect(validateDate('12-12-17')).to.equal(false)
    //   expect(validateDate('30-30-2017')).to.equal(false)
    // })

    // it('should throw an error for non-string arguments', () => {
    //   expect(validateDate.bind(null, 2)).to.throw('invalid non-string arg')
    // })
  })

  describe('- validateLocation', () => {
    it('should return true for comma separated 3-words location args', () => {
      expect(validateLocation('ikeja,lagos,nigeria')).to.equal(true)
    })

    it('should allow spaced comma separated locations', () => {
      expect(validateLocation('ikeja, lagos, nigeria')).to.equal(true)
    })

    it('should return false for invalid locations', () => {
      expect(validateLocation('ikeja,lagos')).to.equal(false)
    })

    it('should throw an error for non-string arguments', () => {
      expect(validateLocation.bind(null, 2)).to.throw('invalid non-string arg')
    })
  })
})
