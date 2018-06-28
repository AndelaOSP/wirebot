const https = require('https')
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env === 'production' || false
  })
})

const { witnessMessage, pAndCMessage } = require('./slack/messages')
const { getSlackUserProfile, sendSlackMessage } = require('./slack/web_client')
const { logServiceError } = require('./utils')
const { formatUserData } = require('./utils')

const { API_URL, PNC_CHANNELS } = process.env

/**
 * Notify Specified People And Culture Channels
 *
 * @param {Object} payload the incident created on the wire api
 *
 * @returns {Promise} a promise containing the notification response
 */
async function notifyPAndChannels (payload) {
  try {
    const { reporter: [{ location: { country } }] } = payload
    const channel = PNC_CHANNELS.split(',').find(
      value => value.toLowerCase().includes(country.toLowerCase())
    ).replace(`-${country.toLowerCase()}`, '')

    return sendSlackMessage(channel, '', pAndCMessage(payload))
  } catch (error) {
    return logServiceError(error)
  }
}

/**
 * Notify WItnesses On Slack
 *
 * @param {Object} payload the created incident from the wiire api
 *
 * @returns {Promise} a promise containing the notification response
 */
async function notifyWitnessesOnSlack (payload) {
  try {
    const { witnesses } = payload
    const witnessIds = witnesses.map(value => value.id)

    return Promise.all(witnessIds.map(
      id => sendSlackMessage(id, '', witnessMessage(payload))
    ))
  } catch (error) {
    return logServiceError(error)
  }
}

/**
 *
 *
 * @param {*} userIds
 * @returns
 */
async function getFormatSlackUserProfiles (userIds) {
  try {
    if (!Array.isArray(userIds)) {
      throw new RangeError('array of user ids required')
    }
    let users = await Promise.all(userIds.map(id => getSlackUserProfile(id)))
      .catch(logServiceError)
    users = users.map(user => formatUserData(user))
      .filter(profile => profile => profile.email)

    return users
  } catch (error) {
    return logServiceError(error)
  }
}

/**
 * Send Wirebot Response To Wire Api
 *
 * @param {Object} payload the incident report
 *
 * @returns {Object} the created incident from wire api
 */
async function sendIncidentToWireApi (payload) {
  try {
    const submission = payload.submission
    const { incidentLocation, subject, description, dateOccurred } = submission
    const payloadData = payload.callback_id.replace('_form', '')
    const [pAndCTeam, levelId, ...witnesses] = payloadData.split('_')
    const user = await getSlackUserProfile(payload.user.id)
    const location = incidentLocation.split(',').map(value => value.trim())
    const incidentReporter = formatUserData(user, pAndCTeam)
    const data = {
      subject,
      description,
      location: {
        name: location[0],
        centre: location[1],
        country: location[2]
      },
      dateOccurred,
      levelId,
      incidentReporter
    }

    if (witnesses.length) {
      data.witnesses = await getFormatSlackUserProfiles(witnesses)
    }

    // post data to wire api
    const { data: { data: apiResult } } = await axios
      .post(`${API_URL}/api/incidents`, data)
    // remove if wire api starts returning reporters location instead of Ids
    apiResult.reporter[0].location = incidentReporter.reporterLocation

    return apiResult
  } catch (error) {
    return logServiceError(error)
  }
}

/**
 * Get Incident By Id
 *
 * @param {String} id wire inncident id
 *
 * @returns {Object} the incident
 */
function getIncidentById (id) {
  return axios.get(`${API_URL}/api/incidents/${id}`)
    .then(incident => incident)
    .catch(logServiceError)
}

module.exports = {
  sendIncidentToWireApi,
  notifyWitnessesOnSlack,
  notifyPAndChannels,
  getIncidentById
}
