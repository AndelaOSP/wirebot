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
function throwServiceError (error) {
  if (error.response) {
    const { status, request, request: { res } } = error.response
    const { method, path, agent: { protocol } } = request
    const { httpVersion, headers: { date }, client: { servername } } = res
    error = `::1 - - [${date}] "${method} ${path} HTTP/${httpVersion}" `
    error += `${status} - "-" "Wireapi (+${protocol}//${servername})"`

    return logger.error(error)
  }

  return logger.error(`${error.message} - ${error.code}`)
}

/**
 * Get Andela Office Location Details
 *
 * @param {String} country the country
 *
 * @returns {Object} Andela office details
 */
function getAndelaOffice (country) {
  const centers = {
    Nigeria: 'Epic Tower', Kenya: 'ST. Catherines', USA: 'New York'
  }
  const center = centers[country]

  return { name: 'office', country, center }
}

/**
 * Get Slack User's Location
 *
 * @param {String} timezone the timezone slack user profile details
 *
 * @returns {Object} the slack users location
 */
function getSlackUserLocation (timezone) {
  const city = timezone.split('\/')[1] // eslint-disable-line no-useless-escape
  const locations = {
    New_York: { centre: 'New York', country: 'USA' },
    Algiers: { centre: 'EPIC Tower', country: 'Nigeria' },
    Nairobi: { centre: 'St. Catherines', country: 'Kenya' }
  }

  return { name: 'office', ...locations[city] }
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
 * @property {string} center - Location Center
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
 * @param {SlackUser} user the slack user's data
 * @param {Location} location the user's slack location based onn timezone
 *
 * @returns {WireApiUser} the formatted user object
 */
function formatUserData (user, location) {
  const {
    id, profile: { email, real_name_normalized: username, image_48: imageUrl
    }, tz
  } = user

  const data = { userId: id, email, username, imageUrl }

  if (location) {
    data.reporterLocation = location
  } else {
    data.witnessLocation = getSlackUserLocation(tz)
  }

  return data
}

/**
 * Validate Slack Dialog WItness Slack Handles Field
 *
 * @param {String} slackHandles the comma separated witnesses slack handles
 *
 * @returns {Boolean} validity of the handles true or false
 */
function validateSlackHandles (slackHandles) {
  return /^@\w+(,\s?@\w+)*?$/.test(slackHandles)
}

/**
 * Validate Slack Dialog Incident Date Field
 *
 * @param {Date} date the date of incident in format (dd-mm-yyy)
 *
 * @returns {Boolean} validity of the date true or false
 */
function validateDate (date) {
  const dateRegex = /^((0[1-9])|([12]\d)|(3[01]))-((0[1-9])|(1[0-2]))-\d{4}$/
  // @TODO might want to also retrict to certain date ranges using moment
  // @TODO error message can be returned here for specificity
  return dateRegex.test(date)
}

/**
 * Validate Slack Dialog Incident Location Field
 *
 * @param {String} location the locationn of incident  (place,city,country)
 *
 * @returns {Boolean} the validity of the location true or false
 */
function validateLocation (location) {
  return /^(.+,){2}.+$/.test(location.trim())
}

module.exports = {
  throwServiceError,
  getAndelaOffice,
  getSlackUserLocation,
  validateDate,
  validateLocation,
  validateSlackHandles,
  formatUserData
}
