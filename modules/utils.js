const moment = require('moment')
const logger = require('../logs')

/**
 * Http Error
 * @typedef {Object} HttpError
 * @property {string} code - The error message
 * @property {string} message - The error code
 * @property {string} response - Http response
 */

/**
 * Service Error Handler
 *
 * @param {HttpError} error the error object
 *
 * @returns {Object} winston log info
 */
function logServiceError (error) {
  const { message, code } = error
  let logMsg = ''
  if (error.response) {
    const { status, request, request: { res } } = error.response
    const { method, path, agent: { protocol }, headers } = request
    const { httpVersion, headers: { date }, client: { servername } } = res
    const ua = headers ? headers['user-agent'] : 'Slackbot 1.0'
    logMsg = `::1 - - [${date}] "${method} ${path} HTTP/${httpVersion}" `
    logMsg += `${status} - "${message || ''} ${code || ''}" ${ua}"`
    logMsg += ` - "Wire (+${protocol}//${servername})`
  } else {
    const stack = process.env.NODE_ENV === 'development' ? error.stack : ''
    logMsg = `${error.message} ${error.code || stack}`
  }

  return logger.error(logMsg)
}

/**
 * Get Andela Office Location Details
 *
 * @param {String} country the country - Nigeria or Kenya or USA
 *
 * @returns {Object} Andela office details
 */
function getAndelaOffice (country) {
  if (!/Nigeria|Kenya|USA|Uganda/i.test(country)) {
    throw new RangeError('country should be Nigeria, Kenya, Uganda or USA')
  }

  const centres = {
    nigeria: 'Epic Tower',
    kenya: 'ST. Catherines',
    usa: 'New York',
    uganda: 'Kampala Uganda'
  }
  const centre = centres[country.toLowerCase()]

  return { name: 'office', country, centre }
}

/**
 * Get Slack User's Location
 * @TODO add uganda location
 * @param {String} timezone the timezone slack user profile details
 *
 * @returns {Object} the slack users location
 */
function getSlackUserLocation (timezone) {
  if (!/^\w+\/\w+$/.test(timezone)) throw new RangeError('Invalid timezone')
  const city = timezone.split('/')[1]

  const locations = {
    New_York: { centre: 'New York', country: 'USA' },
    Algiers: { centre: 'EPIC Tower', country: 'Nigeria' },
    Nairobi: { centre: 'St. Catherines', country: 'Kenya' }
  }

  const fallbackLocation = { center: 'Kampala Uganda', country: 'Uganda' }
  const locale = locations[city] || fallbackLocation

  return { name: 'office', ...locale }
}

/**
 * Slack User Profile
 * @typedef {Object} Profile
 * @property {string} email - User Email
 * @property {string} real_name_normalized - User Name
 * @property {string} image_48 - User Gravatar Url
 */

/**
 * User Location
 * @typedef {Object} Location
 * @property {string} name - Location Name
 * @property {string} centre - Location Centre
 * @property {string} country - Location Country
 */

/**
 * Slack User
 * @typedef {Object} SlackUser
 * @property {string} id - Slack User Id
 * @property {string} tz - Slack User timezone
 * @property {Profile} profile - Slack User {@link Profile} Profile Informationn
 */

/**
 * WireApi User
 * @typedef {Object} WireApiUser
 * @property {string} userId - The user's id
 * @property {string} email - The users's email
 * @property {string} username - The username
 * @property {string} imageUrl  - The user gravatar url
 * @property {Location} [witnessLocation] - The witness location
 * @property {Location} [reporterLocation] - The reporter's location
 */

/**
 * Format user data to include location and remove extraneous slack fields
 *
 * @param {SlackUser} slackUser the slack user's data
 * @param {String} pAndCTeam the PandCTeam chosen from the slack dialogs
 *
 * @returns {WireApiUser} the formatted user object
 */
function formatUserData (slackUser, pAndCTeam) {
  let invalidValue = ''
  const {
    id,
    profile: { email, real_name_normalized: username, image_48: imageUrl },
    tz
  } = slackUser

  if (![id, tz, (pAndCTeam || '')].every((value) => {
    invalidValue = value
    return typeof value === 'string'
  })) {
    throw new RangeError(`Invalid value ${invalidValue}`)
  }

  const user = { userId: id, email, username, imageUrl }

  if (pAndCTeam) {
    user.reporterLocation = getAndelaOffice(pAndCTeam)
  } else {
    user.witnessLocation = getSlackUserLocation(tz)
  }

  return user
}

/**
 * Validate Slack Dialog Incident Date Field
 *
 * @param {Date} date the date of incident in format (DD-MM-YYYY)
 *
 * @returns {Boolean} validity of the date true or false
 */
function validateDate (date) {
  const dateRegex = /^((0[1-9])|([12]\d)|(3[01]))-((0[1-9])|(1[0-2]))-\d{4}$/

  return dateRegex.test(date) && moment(date, 'DD-MM-YYYY')
    .isBefore(moment().add(1, 'min'))
}

/**
 * Validate Slack Dialog Incident Location Field
 *
 * @param {String} location the locationn of incident  (place,city,country)
 *
 * @returns {Boolean} the validity of the location true or false
 */
function validateLocation (location) {
  if (typeof location !== 'string') {
    throw new RangeError('invalid non-string arg')
  }

  return /^(.+,){2}.+$/.test(location.trim())
}

module.exports = {
  logServiceError,
  getAndelaOffice,
  getSlackUserLocation,
  validateDate,
  validateLocation,
  formatUserData
}
