const { createMessageAdapter } = require('@slack/interactive-messages')

const { openSlackDialog } = require('./web_client')
const { validateDate, validateLocation } = require('../utils')
const {
  sendIncidentToWireApi,
  notifyPAndChannels,
  notifyWitnessesOnSlack,
  getIncidentById
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
  incidentSubmittedMessage,
  statusMessage
} = require('./messages')

const { SLACK_VERIFICATION_TOKEN } = process.env
const slackIM = createMessageAdapter(SLACK_VERIFICATION_TOKEN)

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
 * Open Incident Report Dialog Form Handler
 *
 * @param {Object} payload the /*selectWitness slack response
 *
 * @returns {Object} the slack bot message
 */
function openReportIncidentFormDialog (payload, respond) {
  try {
    openSlackDialog(payload.trigger_id, reportFormDialog(`${payload.callback_id}`))

    return exitMessage
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
function openSelectWitness (payload, respond) {
  try {
    const { actions: [ { value } ], callback_id: callbackId } = payload
    const newCallbackId = callbackId.replace(/_witness|_no/g, '')
    const newPayload = { ...payload, callback_id: newCallbackId }

    if (value === 'no') return openReportIncidentFormDialog(newPayload)
    if (value === 'yes') return selectWitnessesMessage(newCallbackId)

    return addWitnessMessage(newCallbackId.split('_').slice(0, 2).join('_'), 1)
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

    respond(loadingMessage)
      .then(async () => {
        const apiResponse = await sendIncidentToWireApi(payload)
        if (!apiResponse) throw new Error('service error occurred')
        const { witnesses } = apiResponse
        if (witnesses && witnesses.length) await notifyWitnessesOnSlack(apiResponse)
        await notifyPAndChannels(apiResponse)
        respond(incidentSubmittedMessage(apiResponse))
      })
  } catch (error) {
    respond(errorMessage)
    throw error
  }
}

/**
 * Incident Status Handler
 *
 * @param {Object} payload the payload containing incident id from slack
 *
 * @returns {Object} the slack bot message
 */
async function incidentStatus (payload) {
  const id = payload.callback_id.split('_')[0]
  const { Status: { status } } = await getIncidentById(id)

  return statusMessage(status)
}

slackIM.action('report', openIncidentLocation)
slackIM.action('location', openIncidentPriority)
slackIM.action(/^.+_priority$/, openAddWitness)
slackIM.action(/^.+_witness$/, openSelectWitness)
slackIM.action(/^.+_selectWitness$/, openAddWitness)
slackIM.action(/^.+_form$/, reportIncident)
slackIM.action(/^.+_status$/, incidentStatus)

module.exports = slackIM
