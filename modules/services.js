const https = require('https')
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env === 'production' || false
  })
})

const { witnessMessage, pAndCMessage } = require('./slack/messages')
const { getSlackUserProfile, sendSlackMessage, createIncidentSlackChannel, inviteUsersToChannel, getAllPrivateChannels } = require('./slack/web_client')
const { formatUserData } = require('./utils')

const { API_URL, PNC_CHANNELS, PNC_KAMPALA, PNC_NAIROBI, PNC_LAGOS, PNC_KIGALI, CHAT_BOT_ID } = process.env

/**
 * Notify Specified People And Culture Channels
 *
 * @param {Object} payload the incident created on the wire api
 *
 * @returns {Promise} a promise containing the notification response
 */

// Gets the details of the newly created channel
async function getCreatedChannel (channelId) {
  const allChannels = await getAllPrivateChannels()
  const wantedChannel = await allChannels.groups.filter(channel => channel.id === channelId)
  return wantedChannel
}

// Invites witnesses, P&C person to the channel
async function inviteToChannel (channelId, witnesses, incidentLocation) {
  let locationPNC = PNC_LAGOS
  let createdChannel

  if (incidentLocation.toLowerCase() === 'kampala') {
    locationPNC = PNC_KAMPALA
  } else if (incidentLocation.toLowerCase() === 'nairobi') {
    locationPNC = PNC_NAIROBI
  } else if (incidentLocation.toLowerCase() === 'kigali') {
    locationPNC = PNC_KIGALI
  }

  if (locationPNC) witnesses.push(locationPNC)
  if (CHAT_BOT_ID) witnesses.push(CHAT_BOT_ID)

  if (witnesses.length > 0 && channelId) {
    witnesses.map(async witness => {
      await inviteUsersToChannel(witness, channelId)
    })
  }

  createdChannel = await getCreatedChannel(channelId)

  return createdChannel
}

function formatWitnesses (witnesses) {
  let witnessString = ''

  witnesses.forEach(witness => {
    witnessString += `${witness}, `
  })

  return witnessString.substring(0, witnessString.length - 2)
}

// Creates a private channel for the newly created incident
async function createIncidentChannel (payload) {
  let witnessList = []
  let relation = {}
  payload.witnesses.map(witness => witnessList.push(witness.userId))
  const incidentLocation = payload.Location.centre
  const incidentId = payload.id
  const channelName = 'wire_' + incidentLocation.toLowerCase() + '_' + incidentId.substring(incidentId.length - 7)
  const channel = await createIncidentSlackChannel(channelName)
  const channelDetails = await inviteToChannel(channel.group.id, witnessList, incidentLocation)

  relation.incidentId = incidentId
  relation.channelId = channel.group.id
  relation.channelName = channelName
  relation.channelMembers = formatWitnesses(channelDetails[0].members)

  await axios({
    method: 'POST', url: `${API_URL}/api/slack/channel`, data: relation
  })
}

function notifyPAndCChannels (payload) {
  try {
    const { reporter: [{ reporterLocation: { centre } }] } = payload
    const getChannel = () => {
      const channel = PNC_CHANNELS.split(',').find(value => value.toLowerCase().includes(centre.split(' ')[0].toLowerCase()))
      return channel
    }
    const incidentChannel = '#' + getChannel()

    return sendSlackMessage(incidentChannel, '', pAndCMessage(payload))
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
    const witnessIds = witnesses.map(value => value.userId)

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

    const response = await axios({
      method: 'POST', url: `${API_URL}/api/incidents`, data
    })

    const apiResult = response.data.data

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
  notifyPAndCChannels,
  createIncidentChannel
}
