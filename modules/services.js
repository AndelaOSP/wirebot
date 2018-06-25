const https = require('https')
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

const { formatUserData, getAndelaOffice } = require('./utils')
const { witnessMessage, pAndCMessage } = require('./slack/messages')
const { getSlackUserProfile, sendSlackMessage } = require('./slack/web_client')
const { throwServiceError } = require('./utils')

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
    const { reporterLocation: { country }, id } = payload
    const locationRegex = new RegExp(`.+-${country}`, 'i')
    const channel = locationRegex.exec(PNC_CHANNELS)[0]
      .replace(`-${country}`, '')

    return sendSlackMessage(channel, '', pAndCMessage(id))
  } catch (error) {
    return throwServiceError(error)
  }
}

/**
 * Notify WItnesses On Slack
 *
 * @param {Object} payload the created incident from the wiire api
 * @param {String} witnesses the witnesses from the slack dialog field
 *
 * @returns {Promise} a promise containing the notification response
 */
async function notifyWitnessesOnSlack (payload, witnesses) {
  return Promise.all(witnesses.split('_')
    .map(id => sendSlackMessage(id, '', witnessMessage(payload))))
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
    const [pAndCTeam, statusId, ...witnesses] = payloadData.split('_')
    const user = await getSlackUserProfile(payload.user.id)
    const location = incidentLocation.split(',').map(value => value.trim())
    const incidentReporter = formatUserData(user, getAndelaOffice(pAndCTeam))
    const data = {
      subject,
      description,
      location: {
        name: location[0],
        centre: location[1],
        country: location[2]
      },
      dateOccurred,
      statusId,
      incidentReporter
    }
    //
    if (witnesses.length) {
      data.witnesses = await Promise.all(witnesses
        .map(id => getSlackUserProfile(id).then(formatUserData)))
    }

    // run wire api call to post data
    const { data: { data: apiResult } } = await axios
      .post(`${API_URL}/api/incidents`, data)

    apiResult.witnesses = payload.witnesses
    return apiResult
  } catch (error) {
    return throwServiceError(error)
  }
}

module.exports = {
  sendIncidentToWireApi,
  notifyWitnessesOnSlack,
  notifyPAndChannels
}
