const locationMessage = {
  replace_original: true,
  delete_original: true,
  attachments: [
    {
      color: '#5A352D',
      title: 'Which Andela P&C team should handle this?',
      callback_id: 'location',
      actions: [
        {
          name: 'location',
          text: 'Select Andela P&C location',
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
            }
          ]
        }
      ]
    }
  ]
}
const errorMessages = {
  dateError: {
    name: 'date',
    error: 'Sorry, this date format is invalid!'
  },
  witnessesError: {
    name: 'witnesses',
    error: 'Uh-oh. You supplied invalid slack handles!'
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

function initiationMessage (greeting) {
  return {
    attachments: [{
      pretext: greeting,
      title: 'Would you like to report an incident?',
      color: '#5A352D',
      callback_id: 'report',
      actions: [
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
    }]
  }
}

function priorityMessage (location) {
  return {
    replace_original: true,
    delete_original: true,
    attachments: [
      {
        color: '#5A352D',
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

function addWitnessMessage (id, pristine) {
  // remove duplicate slack ids
  id = Array.from(new Set(id.split('_'))).join('_')
  const slackHandles = pristine ? '' : id.replace(/\w+_\d_/g, '').split('_')
    .map(handle => `<@${handle}>`).join(' ')
  const pretext = slackHandles ? `_you have added_ ${slackHandles}` : ''
  const actions = [
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

  if (slackHandles) {
    actions.push({
      name: 'clear',
      text: 'clear citnesses',
      type: 'button',
      value: 'clear'
    })
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

function selectWitnessesMessage (id) {
  return {
    replace_original: true,
    delete_original: true,
    attachments: [
      {
        color: '#5A352D',
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

function reportFormDialog (id) {
  return {
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
        min_length: 50,
        max_length: 3000,
        placeholder: 'tell us how it happened',
        hint: 'description should be between 50 - 3000 characters.'
      }
    ]
  }
}

function witnessMessage (incident) {
  const {
    incidentReporter, subject, Location: { name, center, country }, dateOccurred
  } = incident

  return [{
    pretext: `<@${incidentReporter}> reported an incident and tagged you \
    as a witness`,
    color: '#36a64f',
    fields: [
      {
        title: 'Subject',
        value: subject
      },
      {
        title: 'Location',
        value: `${name}, ${center}, ${country}`
      },
      {
        title: 'Date Occurred',
        value: `<!date^${dateOccurred}^{date} at {time}>`
      }
    ]
  }]
}

function pAndCMessage (incidentId) {
  return [{
    pretext: 'New incident reported',
    color: '#5A352D',
    fields: [
      {
        title: 'Incident ID',
        value: `\`${incidentId}\``
      }
    ]
  }]
}

function incidentSubmittedMessage (incident) {
  const { incidentId } = incident

  return {
    pretext: 'Thank you for reporting this incident.',
    text: `Your Incident Id is ${incidentId}`,
    attachments: [{
      color: 'D00000',
      actions: [
        {
          name: 'view',
          text: 'View Incident',
          type: 'button',
          style: 'primary',
          value: 'open'
        },
        {
          name: 'status',
          text: 'Get Incident Status',
          type: 'button',
          value: 'status'
        }
      ]
    }]
  }
}

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
  errorMessages,
  incidentSubmittedMessage,
  loggerMessage
}
