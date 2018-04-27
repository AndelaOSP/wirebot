const axios = require('axios');
const dotenv = require('dotenv');
const util = require('util');

dotenv.load();

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

const logError = error => {
  axios.post(slackWebhookUrl, {
    'username': 'wirebot',
    'icon_emoji': ':face_vomiting:',
    'text': 'Oops! Something isn\'t quite right.',
    'attachments': [
      {
        'color': 'D00000',
        'text': util.inspect(error)
      }
    ]
  });

};

module.exports = {
  logError
};
