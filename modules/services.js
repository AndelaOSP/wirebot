const https = require('https')
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env === 'production' || false
  })
})

const { witnessMessage, pAndCMessage } = require('./slack/messages')
const { getSlackUserProfile, sendSlackMessage } = require('./slack/web_client')
const { formatUserData } = require('./utils')

const { API_URL, PNC_CHANNELS } = process.env

/**
 * Notify Specified People And Culture Channels
 *
 * @param {Object} payload the incident created on the wire api
 *
 * @returns {Promise} a promise containing the notification response
 */
function notifyPAndCChannels (payload) {
  try {
    const { reporter: [{ reporterLocation: { country } }] } = payload
    const channel = PNC_CHANNELS.split(',').find(
      value => value.toLowerCase().includes(country.toLowerCase())
    ).replace(`-${country.toLowerCase()}`, '')

    return sendSlackMessage(channel, '', pAndCMessage(payload))
  } catch (error) {
    throw error
  }
}

/**
 * Notify WItnesses On Slack
 *
 * @param {Object} payload the created incident from the wiire api
 *
 * @returns {Promise} a promise containing the notification response
 */
function notifyWitnessesOnSlack (payload) {
  try {
    const { witnesses } = payload
    const witnessIds = witnesses.map(value => value.slackId)

    return Promise.all(witnessIds.map(
      id => sendSlackMessage(id, '', witnessMessage(payload))
    ))
  } catch (error) {
    throw error
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

    users = users.map(user => formatUserData(user))
      .filter(profile => profile => profile.email)

    return users
  } catch (error) {
    throw error
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
    const [name, centre, country] = incidentLocation.split(',')
      .map(value => value.trim())
    const incidentReporter = formatUserData(user, pAndCTeam)
    const data = {
      subject,
      description,
      location: { name, centre, country },
      dateOccurred,
      levelId,
      incidentReporter,
      witnesses
    }
    if (witnesses.length) {
      data.witnesses = await getFormatSlackUserProfiles(witnesses)
    }

    console.log("=======>", data);

    const { data: { data: apiResult } } = await axios({
      method: 'POST', url: `${API_URL}/api/incidents`, data
    })

    // remove if wire api starts returning location instead of locationIds
    apiResult.reporter[0] = {
      ...incidentReporter
    }
    if (witnesses.length) {
      apiResult.witnesses = data.witnesses
        .map(value => ({ ...value }))
    }

    return apiResult
  } catch (error) {
    throw error
  }
}

module.exports = {
  sendIncidentToWireApi,
  notifyWitnessesOnSlack,
  notifyPAndCChannels
}
