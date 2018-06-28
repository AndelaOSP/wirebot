const { WebClient } = require('@slack/client')

const { chat, dialog, users } = new WebClient(process.env.SLACK_TOKEN)

/**
 * Get Slack User Profile
 *
 * @param {String} id slack user id
 *
 * @returns {Promise} the slack user
 */
function getSlackUserProfile (id) {
  return users.info({ user: id }).then(data => data.user)
}

/**
 * Send A Slack Message
 *
 * @param {String} channel the slack channel id
 * @param {String} text the text message
 * @param {Array} attachments message attachments eg buttons
 *
 * @returns {Promise} the sent message
 */
function sendSlackMessage (channel, text, attachments) {
  return chat.postMessage({ channel, text, attachments })
}

/**
 * Open Slack dialog
 *
 * @param {String} triggerId dialog trigger Id
 * @param {Object} dialogData dialog config
 * @returns {Promise} slack dialog
 */
function openSlackDialog (triggerId, dialogData) {
  return dialog.open({ trigger_id: triggerId, dialog: dialogData })
}

module.exports = {
  openSlackDialog,
  getSlackUserProfile,
  sendSlackMessage
}
