const initiate = {
  attachments: [
    {
      color: '#5A352D',
      title: 'Do you want to report an incident?',
      callback_id: 'report',
      actions: [
        {
          name: 'yes',
          text: 'Yes',
          type: 'button',
          value: 'yes',
        },
        {
          name: 'no',
          text: 'No',
          type: 'button',
          value: 'no',
        },
      ],
    },
  ],
};

const categoryMessage = {
  attachments: [
    {
      'color': '#5A352D',
      'title': 'What category does the incident belong to?',
      'callback_id': 'category',
      'actions': [
        {
          'name': 'red',
          'text': 'Red',
          'type': 'button',
          'value': 'red',
          'style': 'danger'
        },
        {
          'name': 'yellow',
          'text': 'Yellow',
          'type': 'button',
          'value': 'yellow'
        },
        {
          'name': 'green',
          'text': 'Green',
          'type': 'button',
          'value': 'green'
        },
        {
          'name': 'other',
          'text': 'I don\'t know',
          'type': 'button',
          'value': 'other'
        }
      ]
    }
  ]
};

const getDateMessage = {
  text: 'When did the incident occur? (dd-mm-yy)'
};

const getLocationMessage = {
  attachments: [
    {
      color: '#5A352D',
      title: 'Where did this happen?',
      callback_id: 'incident_location',
      actions: [
        {
          name: 'location',
          text: 'Select Location...',
          value: 'location',
          type: 'select',
          options: [
            {
              text: 'Office, New York, USA',
              value: 'Office, New York, USA'
            },
            {
              text: 'Office, Epic Tower, Nigeria',
              value: 'Office, Epic Tower, Nigeria'
            },
            {
              text: 'Office, St. Catherines, Kenya',
              value: 'Office, St. Catherines, Kenya'
            },
            {
              text: 'Office, Kampala, Uganda',
              value: 'Office, Kampala, Uganda'
            },
            {
              text: 'Other',
              value: 'Other'
            }
          ]
        },
        {
          name: 'submit',
          text: 'Next',
          type: 'button',
          value: 'submit'
        }
      ]
    
    }
  ]
};

const getLocationHandlerMessage = {
  attachments: [
    {
      color: '#5A352D',
      title: 'Where should this be handled',
      callback_id: 'location_verifier',
      actions: [
        {
          name: 'select_location',
          text: 'Select Location...',
          value: 'location',
          type: 'select',
          options: [
            {
              text: 'New York',
              value: 'New York'
            },
            {
              text: 'Lagos',
              value: 'Lagos'
            },
            {
              text: 'Nairobi',
              value: 'Nairobi'
            },
            {
              text: 'Kampala',
              value: 'Kampala'
            }
          ]
        },
        {
          name: 'submit',
          text: 'Next',
          type: 'button',
          value: 'submit'
        }
      ]
    
    }
  ]
};

const getConfirmationMessage = (data) =>
{
  return {
    'attachments': [
      {
        'color': '#36a64f',
        'pretext': 'Please confirm the incident',
        'callback_id': 'confirm',
        'fields': [
          {
            'title': 'Subject',
            'value': data.subject,
            'short': false
          },
          {
            'title': 'Category',
            'value': data.category,
            'short': false
          },
          {
            'title': 'Date',
            'value': data.date,
            'short': false
          },
          {
            'title': 'Location',
            'value': data.location,
            'short': false
          },
          {
            'title': 'Description',
            'value': data.description,
            'short': false
          },
          {
            'title': 'Witnesses',
            'value': data.witnesses,
            'short': false
          }
        ],
        'actions': [
          {
            'name': 'confirm',
            'text': 'Confirm',
            'type': 'button',
            'value': 'confirm',
            'style': 'primary'
          },
          {
            'name': 'cancel',
            'text': 'Cancel',
            'type': 'button',
            'value': 'cancel'
          }
        ]
      }
    ]
  };
};

const witnessesMessage = {
  attachments: [
    {
      color: '#5A352D',
      title: 'Do you have any witnesses?',
      callback_id: 'witnesses',
      actions: [
        {
          name: 'yes',
          text: 'Yes',
          type: 'button',
          value: 'yes',
        },
        {
          name: 'no',
          text: 'No',
          type: 'button',
          value: 'no',
        },
      ],
    },
  ],
};

module.exports = {
  initiationMessage: initiate,
  getDateMessage,
  getLocationMessage,
  getLocationHandlerMessage,
  getConfirmationMessage,
  categoryMessage,
  witnessesMessage
};
