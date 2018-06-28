const slackUser = {
  id: 'W012A3CDE',
  team_id: 'T012AB3C4',
  name: 'spengler',
  deleted: false,
  color: '9f69e7',
  real_name: 'Egon Spengler',
  tz: 'America/Los_Angeles',
  tz_label: 'Pacific Daylight Time',
  tz_offset: -25200,
  profile: {
    avatar_hash: 'ge3b51ca72de',
    status_text: 'Print is dead',
    status_emoji: ':books:',
    real_name: 'Egon Spengler',
    display_name: 'spengler',
    real_name_normalized: 'Egon Spengler',
    display_name_normalized: 'spengler',
    email: 'spengler@ghostbusters.example.com',
    image_24: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_32: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_48: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_72: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_192: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    image_512: 'https://.../avatar/e3b51ca72dee4ef87916ae2b9240df50.jpg',
    team: 'T012AB3C4'
  },
  is_admin: true,
  is_owner: false,
  is_primary_owner: false,
  is_restricted: false,
  is_ultra_restricted: false,
  is_bot: false,
  updated: 1502138686,
  is_app_user: false,
  has_2fa: false
}

const errorStub = {
  message: 'hello error',
  code: 'error code',
  stack: 'stack trace',
  response: {
    request: {
      headers: {
        'user-agent': 'Intel x86'
      },
      agent: {
        protocol: 'https'
      },
      res: {
        headers: {
          date: Date.now()
        },
        client: {
          servername: 'wirebot'
        }
      }
    }
  }
}

const incident = {
  'id': 'cjj3xjssz0000kj3juivyagyd',
  'description': 'something happened and I didnt like it at all',
  'subject': 'Sexual Harrassment',
  'dateOccurred': '2017-07-11T21:00:00.000Z',
  'createdAt': '2018-07-02T07:15:31.860Z',
  'updatedAt': '2018-07-02T07:15:31.860Z',
  'categoryId': null,
  'statusId': 1,
  'locationId': 'cjiu0wu800000h43j4h2caq8n',
  'levelId': 3,
  'Level': {
    'name': 'Green'
  },
  'Status': {
    'status': 'Pending'
  },
  'Location': {
    'name': 'bottle',
    'centre': 'lagos',
    'country': 'kenya'
  },
  'assignees': [],
  'reporter': [
    {
      'id': 'brian',
      'email': 'brian@g.com',
      'username': 'brian',
      'imageUrl': 'brian.jpeg',
      'createdAt': '2018-06-25T08:51:57.390Z',
      'updatedAt': '2018-06-25T08:51:57.390Z',
      'locationId': 'cjiu0wu9x0002h43jc8k0k1qk',
      location: {
        'name': 'bottle',
        'centre': 'lagos',
        'country': 'kenya'
      },
      'roleId': 1
    }
  ],
  'witnesses': [
    {
      'id': '2nd',
      'email': 'person2@gmail.com',
      'username': 'person2',
      'imageUrl': 'person2.jpeg',
      'createdAt': '2018-06-25T08:51:57.514Z',
      'updatedAt': '2018-06-25T08:51:57.514Z',
      'locationId': 'cjiu0wuau0003h43j4iem3v6y',
      location: {
        'name': 'bottle',
        'centre': 'lagos',
        'country': 'kenya'
      },
      'roleId': 1
    },
    {
      'id': '3rd',
      'email': 'person3@gmail.com',
      'username': 'person3',
      'imageUrl': 'person3.jpeg',
      'createdAt': '2018-06-25T08:51:57.521Z',
      'updatedAt': '2018-06-25T08:51:57.521Z',
      'locationId': 'cjiu0wuc70004h43jr7sn6k6s',
      location: {
        'name': 'bottle',
        'centre': 'lagos',
        'country': 'kenya'
      },
      'roleId': 1
    }
  ]
}

const serverError = (syscall, code) => ({ syscall, code })

module.exports = {
  slackUser,
  errorStub,
  serverError,
  incident
}
