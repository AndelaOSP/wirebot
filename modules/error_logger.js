const dotenv = require('dotenv');

dotenv.load();

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

const catchError = error => {
  const slackErrorNotify = require('slack-error-notify')(slackWebhookUrl);
  slackErrorNotify.bug(slackErrorNotify.log(error));
};

module.exports = {
  catchError
};
