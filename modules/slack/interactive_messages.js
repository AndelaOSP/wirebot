const { createMessageAdapter } = require('@slack/interactive-messages')

const { openSlackDialog } = require('./web_client')
const { validateDate, validateLocation, logServiceError } = require('../utils')
const {
  sendIncidentToWireApi,
  notifyPAndCChannels,
  notifyWitnessesOnSlack // eslint-disable-line no-unused-vars
} = require('../services')
const {
  reportFormDialog,
  exitMessage,
  errorMessage,
  formErrorMessages,
  locationMessage,
  priorityMessage,
  selectWitnessesMessage,
  addWitnessMessage,
  loadingMessage,
  incidentSubmittedMessage
} = require('./messages')

const { SLACK_VERIFICATION_TOKEN } = process.env
const slackIM = createMessageAdapter(SLACK_VERIFICATION_TOKEN, {
  syncResponseTimeout: 3000, lateResponseFallbackEnabled: true
})

/**
 * Open Bot Incident Location Question Handler
 * @TODO wire-api PnC Team instead of location.
 * @param {Object} payload the /report response from slack
 *
 * @returns {Object} slack bot message
 */
function openIncidentLocation (payload, respond) {
  try {
    const { actions: [ { value } ] } = payload

    return value === 'yes' ? locationMessage : exitMessage
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

/**
 * Open Incident Priority Question Handler
 *
 * @param {Object} payload the /*location response from slack
 *
 * @returns {Object} the slack bot message
 */
function openIncidentPriority (payload, respond) {
  try {
    const { actions: [ { selected_options: [ { value } ] } ] } = payload

    return priorityMessage(value)
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

/**
 * Open Incident Witness Question Handler
 *
 * @param {Object} payload the /*priority response from slack
 *
 * @returns {Object} the slack bot message
 */
function openAddWitness (payload, respond) {
  try {
    const pristine = /^.+_priority$/.test(payload.callback_id)
    const value = pristine
      ? payload.actions[0].value : payload.actions[0].selected_options[0].value
    const newCallbackId = `${payload.callback_id
      .replace(/_priority|_selectWitness/g, '')}_${value}`

    return addWitnessMessage(newCallbackId, pristine)
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

/**
 * Open Incident Witness Select Handler
 *
 * @param {Object} payload the /*witness slack response
 *
 * @returns {Object} the slack bot message
 */
async function openSelectWitness (payload, respond) {
  try {
    // eslint-disable-next-line camelcase
    const { actions: [ { value } ], callback_id, trigger_id } = payload
    const newCallbackId = callback_id.replace(/_witness|_no/g, '')
    const witnesses = newCallbackId.split('_').slice(0, 2).join('_')
    const dialogForm = reportFormDialog(newCallbackId)

    if (value === 'no') {
      await openSlackDialog(trigger_id, dialogForm)
      respond(exitMessage)
    }
    if (value === 'yes') return selectWitnessesMessage(newCallbackId)

    return value === 'no' ? void 0 : addWitnessMessage(witnesses, 1)
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

/**
 * Report Incident Handler
 *
 * @param {Object} payload the /*form payload from slack
 *
 * @returns {Object} the slack bot message
 */
function reportIncident (payload, respond) {
  try {
    const submission = payload.submission
    const { dateOccurred, incidentLocation } = submission
    const { dateError, locationError } = formErrorMessages
    const message = { errors: [] }
    if (!validateLocation(incidentLocation)) message.errors.push(locationError)
    if (!validateDate(dateOccurred)) message.errors.push(dateError)
    if (message.errors.length) return message
    // log service error for respond promise. node-slack-sdk promise issue
    respond(loadingMessage)
      .then(() => sendIncidentToWireApi(payload))
      .then((apiResponse) => {
        // eslint-disable-next-line no-unused-vars
        const { witnesses } = apiResponse
        respond(incidentSubmittedMessage(apiResponse))
        // Uncomment the below commented out code to enable notifying tagged witnesses via Slack
        Promise.all([/* (witnesses && witnesses.length && notifyWitnessesOnSlack(apiResponse)), */
          notifyPAndCChannels(apiResponse)
        ]).catch(logServiceError)
      })
      .catch(err => {
        respond(errorMessage)
        return logServiceError(err)
      })

    return void 0
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

slackIM.action('report', openIncidentLocation)
slackIM.action('location', openIncidentPriority)
slackIM.action(/^.+_priority$/, openAddWitness)
slackIM.action(/^.+_witness$/, openSelectWitness)
slackIM.action(/^.+_selectWitness$/, openAddWitness)
slackIM.action(/^.+_form$/, reportIncident)

module.exports = slackIM
