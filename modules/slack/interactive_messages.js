const { createMessageAdapter } = require('@slack/interactive-messages')

const { openSlackDialog } = require('./web_client')
const {
  validateDate,
  validateSlackHandles,
  validateLocation
} = require('../utils')
const {
  sendIncidentToWireApi,
  notifyPAndChannels,
  notifyWitnessesOnSlack
} = require('../services')
const {
  reportFormDialog,
  exitMessage,
  errorMessages,
  locationMessage,
  priorityMessage,
  selectWitnessesMessage,
  addWitnessMessage,
  incidentSubmittedMessage
} = require('./messages')

const { SLACK_VERIFICATION_TOKEN } = process.env
const slackIM = createMessageAdapter(SLACK_VERIFICATION_TOKEN)

/**
 * Open Bot Incident Location Question
 * @TODO wire-api PnC Team instead of location.
 * @param {Object} payload the /report response from slack
 *
 * @returns {Object} slack bot message
 */
function openIncidentLocation (payload) {
  const { actions: [ { value } ] } = payload

  return value === 'yes' ? locationMessage : exitMessage
}

/**
 * Open Incident Priority Question
 *
 * @param {Object} payload the /*location response from slack
 *
 * @returns {Object} the slack bot message
 */
function openIncidentPriority (payload) {
  const { actions: [ { selected_options: [ { value } ] } ] } = payload

  return priorityMessage(value)
}

/**
 * Open Incident Witness Question
 *
 * @param {Object} payload the /*priority response from slack
 *
 * @returns {Object} the slack bot message
 */
function openAddWitness (payload) {
  const pristine = /^.+_priority$/.test(payload.callback_id)
  const value = pristine
    ? payload.actions[0].value : payload.actions[0].selected_options[0].value
  const newCallbackId = `${payload.callback_id
    .replace(/_priority|_selectWitness/g, '')}_${value}`

  return addWitnessMessage(newCallbackId, pristine)
}

/**
 * Open Incident Report Dialog Form
 *
 * @param {Object} payload the /*selectWitness slack response
 *
 * @returns {Object} the slack bot message
 */
function openReportIncidentFormDialog (payload) {
  openSlackDialog(payload.trigger_id, reportFormDialog(`${payload.callback_id}`))

  return exitMessage
}

/**
 * Open Incident Witness Select
 *
 * @param {Object} payload the /*witness slack response
 *
 * @returns {Object} the slack bot message
 */
function openSelectWitness (payload) {
  const { actions: [ { value } ], callback_id: callbackId } = payload
  const newCallbackId = callbackId.replace(/_witness|_no/g, '')
  const newPayload = { ...payload, callback_id: newCallbackId }

  if (value === 'no') return openReportIncidentFormDialog(newPayload)
  if (value === 'yes') return selectWitnessesMessage(newCallbackId)

  return addWitnessMessage(newCallbackId.split('_').slice(0, 2).join('_'), 1)
}

/**
 * Report Incident
 *
 * @param {Object} payload the /*form payload from slack
 *
 * @returns {Object} the slack bot message
 */
async function reportIncident (payload) {
  const submission = payload.submission
  const { dateOccurred, witnesses = null, incidentLocation } = submission
  const { dateError, witnessesError, locationError } = errorMessages
  const message = { errors: [] }

  if (witnesses && !validateSlackHandles(witnesses)) {
    message.errors.push(witnessesError)
  }

  if (!validateLocation(incidentLocation)) message.errors.push(locationError)
  if (!validateDate(dateOccurred)) message.errors.push(dateError)
  if (message.errors.length) return message
  const apiResponse = await sendIncidentToWireApi(payload)

  await notifyWitnessesOnSlack(apiResponse, witnesses)
  await notifyPAndChannels(apiResponse)

  return incidentSubmittedMessage
}

slackIM.action('report', openIncidentLocation)
slackIM.action('location', openIncidentPriority)
slackIM.action(/^.+_priority$/, openAddWitness)
slackIM.action(/^.+_witness$/, openSelectWitness)
slackIM.action(/^.+_selectWitness$/, openAddWitness)
slackIM.action(/^.+_form$/, reportIncident)

module.exports = slackIM
