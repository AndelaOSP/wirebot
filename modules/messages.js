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
      'actions' : [
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
        'actions' : [
          {
            'name': 'confirm',
            'text': 'Confirm',
            'type': 'button',
            'value': 'confirm',
            'style': 'ok'
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
  getConfirmationMessage,
  categoryMessage,
  witnessesMessage
};
