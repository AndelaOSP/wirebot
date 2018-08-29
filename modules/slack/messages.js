const moment = require('moment')

const priorities = ['High', 'Medium', 'Normal']
const color = { primary: '#36a64f', secondary: '#EEEEEE' }
const yesNoActions = [
  {
    name: 'yes',
    text: 'Yes',
    type: 'button',
    style: 'primary',
    value: 'yes'
  },
  {
    name: 'no',
    text: 'No',
    type: 'button',
    style: 'danger',
    value: 'no'
  }
]
const loadingMessage = { text: 'please wait...' }
const errorMessage = {
  replace_original: true,
  delete_original: true,
  text: 'Something went wrong. Please try again.'
}
const locationMessage = {
  replace_original: true,
  delete_original: true,
  attachments: [
    {
      color: color.primary,
      title: 'Which Andela People team should handle this?',
      callback_id: 'location',
      actions: [
        {
          name: 'location',
          text: 'select people team',
          type: 'select',
          options: [
            {
              text: 'Nigeria',
              value: 'Nigeria'
            },
            {
              text: 'Kenya',
              value: 'Kenya'
            },
            {
              text: 'United States',
              value: 'USA'
            },
            {
              text: 'Uganda',
              value: 'Uganda'
            }
          ]
        }
      ]
    }
  ]
}
const formErrorMessages = {
  dateError: {
    name: 'dateOccurred',
    error: 'Sorry, this date is invalid!'
  },
  locationError: {
    name: 'incidentLocation',
    error: 'location format should be (place, city, country)'
  }
}
const exitMessage = {
  text: '',
  replace_original: true,
  delete_original: true
}

/**
 * initiationMessage
 *
 * @param {String} greeting user greeting
 *
 * @returns {Object} the slack message
 */
function initiationMessage (greeting) {
  return {
    attachments: [{
      pretext: greeting,
      title: 'Would you like to report an incident?',
      color: color.primary,
      callback_id: 'report',
      actions: yesNoActions
    }]
  }
}

/**
 * Priority Message
 *
 * @param {String} location p and c location
 *
 * @returns {Object} the slack message
 */
function priorityMessage (location) {
  return {
    replace_original: true,
    delete_original: true,
    attachments: [
      {
        color: color.primary,
        title: 'What priority should we assign to this incident?',
        callback_id: `${location}_priority`,
        actions: [
          {
            name: 'high',
            text: 'high',
            type: 'button',
            value: '1',
            style: 'danger'
          },
          {
            name: 'medium',
            text: 'medium',
            type: 'button',
            value: '2',
            style: 'primary'
          },
          {
            name: 'low',
            text: 'low',
            type: 'button',
            value: '3'
          }
        ]
      }
    ]
  }
}

/**
 * Add Witness Message
 *
 * @param {String} id the callback id
 * @param {Boolean} pristine clear witness flag
 *
 * @returns {Object} the slack message
 */
function addWitnessMessage (id, pristine) {
  // remove duplicate slack ids
  id = Array.from(new Set(id.split('_'))).join('_')
  const slackHandles = pristine ? '' : id.replace(/\w+_\d_/g, '').split('_')
    .map(handle => `<@${handle}>`).join(' ')
  const pretext = slackHandles ? `_you have added_ ${slackHandles}` : ''
  let actions = yesNoActions

  if (slackHandles) {
    actions = [
      ...yesNoActions,
      {
        name: 'clear',
        text: 'clear witnesses',
        type: 'button',
        value: 'clear'
      }
    ]
  }

  return {
    replace_original: true,
    delete_original: true,
    attachments: [
      {
        pretext,
        color: '#5A352D',
        title: `Would you like to add ${pristine ? 'a' : 'another'} witness ?`,
        callback_id: `${id}_witness`,
        actions
      }
    ]
  }
}

/**
 * Select Witness Message
 *
 * @param {String} id slack callback id
 *
 * @returns {Object} the slack message
 */
function selectWitnessesMessage (id) {
  return {
    replace_original: true,
    delete_original: true,
    attachments: [
      {
        color: color.primary,
        title: 'Select someone who witnessed this incident.',
        callback_id: `${id}_selectWitness`,
        actions: [
          {
            type: 'select',
            name: 'witness',
            data_source: 'users',
            placeholder: 'Witness of this incident'
          }
        ]
      }
    ]
  }
}

/**
 * Report Form Dialog Message
 *
 * @param {String} id the callback Id
 *
 * @returns {Object} the slack dialog
 */
function reportFormDialog (id) {
  return {
    replace_original: true,
    delete_original: true,
    title: 'Incident Report Form',
    submit_label: 'Report',
    callback_id: `${id}_form`,
    elements: [
      {
        label: 'Subject',
        type: 'text',
        name: 'subject',
        min_length: 10,
        max_length: 70,
        placeholder: 'summary of what happened',
        hint: 'subject should be between 10 - 70 characters.'
      },
      {
        label: 'Date',
        type: 'text',
        name: 'dateOccurred',
        min_length: 10,
        max_length: 10,
        placeholder: 'when did this happen?',
        hint: 'date should be in the past with format (dd-mm-yyyy).'
      },
      {
        label: 'Location',
        type: 'text',
        name: 'incidentLocation',
        min_length: 10,
        placeholder: 'where did this happen?',
        hint: 'where the incident occurred(place, city, country).'
      },
      {
        label: 'Description',
        type: 'textarea',
        name: 'description',
        min_length: 15,
        max_length: 3000,
        placeholder: 'tell us how it happened',
        hint: 'description should be between 15 - 3000 characters.'
      }
    ]
  }
}

/**
 * Get Incident Action Buttons
 *
 * @param {Object} id the incident ID
 *
 * @returns {Array} of slack action buttons
 */
function getIncidentActions (id) {
  return [
    {
      name: 'view',
      text: 'View Incident On Wire',
      type: 'button',
      url: `${process.env.APP_URL}/incidents/${id}`,
      style: 'primary'
    },
    {
      name: 'status',
      text: 'Get Incident Status',
      type: 'button',
      value: id,
      style: 'danger'
    }
  ]
}

/**
 * Witness Message
 *
 * @param {Object} incident the incident payload from wire-api
 *
 * @returns {Object} slack attachment message
 */
function witnessMessage (incident) {
  const { Location: { name, centre, country }, dateOccurred } = incident

  return [{
    pretext: `<@${incident.reporter[0].slackId}> reported an incident and tagged you\
 as a witness`,
    color: color.primary,
    fields: [
      {
        title: 'Subject',
        value: incident.subject
      },
      {
        title: 'Location',
        value: `${name}, ${centre}, ${country}`
      },
      {
        title: 'Date Incident Occurred',
        value: moment(dateOccurred).format('DD MMMM, YYYY')
      }
    ]
  }]
}

/**
 * P and C Message
 *
 * @param {Object} incident the incident payload from wire-api
 *
 * @returns {Object} slack attachment message
 */
function pAndCMessage (incident) {
  const { id, subject, reporter: [{ slackId: author }], levelId } = incident

  return [{
    pretext: 'New incident on Wire',
    color: color.secondary,
    author_name: `Reported by <@${author}>`,
    title: subject,
    title_link: `${process.env.APP_URL}/timeline/${id}`,
    callback_id: 'status',
    fields: [
      {
        title: 'Incident ID',
        value: `${id}`
      },
      {
        title: 'Priority',
        value: priorities[levelId - 1]
      }
    ],
    actions: [getIncidentActions(id)[0]] // add status btn if wirebot authed
  }]
}

/**
 * Incident Submission Message
 *
 * @param {Object} incident the incident payload from wire-api
 *
 * @returns {Object} slack attachment message
 */
function incidentSubmittedMessage (incident) {
  const { id, subject, levelId } = incident

  return {
    replace_original: true,
    delete_original: true,
    attachments: [{
      pretext: 'Thank you for reporting this incident.',
      color: color.primary,
      callback_id: 'status',
      fields: [
        {
          title: 'Incident ID',
          value: `\`${id}\``
        },
        {
          title: 'Subject',
          value: `${subject}`
        },
        {
          title: 'Priority',
          value: priorities[levelId - 1]
        }
      ]
    }]
  }
}

/**
 * Incident Status Message
 * wip when wire-api adds authorization token or credentials for bot status req
 * @param {String} status the incident status
 * @returns
 */
function statusMessage (status) {
  return {
    replace_original: true,
    delete_original: true,
    text: `/${status}/`
  }
}

/**
 * Slack Logger Message
 *
 * @param {*} text
 * @returns
 */
function loggerMessage (text) {
  return { username: 'wirebot', attachments: [{ color: 'D00000', text }] }
}

module.exports = {
  reportFormDialog,
  initiationMessage,
  locationMessage,
  priorityMessage,
  addWitnessMessage,
  selectWitnessesMessage,
  pAndCMessage,
  witnessMessage,
  exitMessage,
  errorMessage,
  formErrorMessages,
  incidentSubmittedMessage,
  statusMessage,
  loadingMessage,
  loggerMessage
}
