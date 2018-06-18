const axios = require('axios');
const dotenv = require('dotenv');
const SlackClient = require('@slack/client').WebClient;

dotenv.load();

const sc = new SlackClient(process.env.SLACK_BOT_TOKEN);

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

const people_new_york = process.env.SLACK_PEOPLE_NEW_YORK;
const people_lagos = process.env.SLACK_PEOPLE_LAGOS;
const people_nairobi = process.env.SLACK_PEOPLE_NAIROBI;
const people_kampala = process.env.SLACK_PEOPLE_KAMPALA;

const getChannelNamePromise = (channelId) => {
  return sc.groups.info(channelId)
    .then(groupDetails => {
      return groupDetails.group.name;
    });
};

const postIncident = (incidentDetails) => {
  return axios.post(slackWebhookUrl, {
    'channel': `#${incidentDetails.channelName}`,
    'username': 'wirebot',
    'icon_emoji': ':robot_face:',
    'attachments': [
      {
        'color': '#5A352D',
        'pretext': 'New incident reported',
        'fields': [
          {
            'title': 'Incident ID',
            'value': `\`${incidentDetails.incidentId}\``
          }
        ]
      }
    ]
  });
};

const newIncidentNotifier = (incident, incidentHandler) => {
  if (incidentHandler === 'New York') {
    return getChannelNamePromise(people_new_york).then(channelName => {
      let incidentDetails = {
        channelName,
        incidentId: incident.id
      };

      return postIncident(incidentDetails);
    });
  } 
  else if (incidentHandler === 'Nairobi') {
    return getChannelNamePromise(people_nairobi).then(channelName => {
      let incidentDetails = {
        channelName,
        incidentId: incident.id
      };

      return postIncident(incidentDetails);
    });
  } else if (incidentHandler === 'Lagos') {
    return getChannelNamePromise(people_lagos).then(channelName => {
      let incidentDetails = {
        channelName,
        incidentId: incident.id
      };

      return postIncident(incidentDetails);
    });
  } else {
    return getChannelNamePromise(people_kampala).then(channelName => {
      let incidentDetails = {
        channelName,
        incidentId: incident.id
      };

      return postIncident(incidentDetails);
    });
  }
};

module.exports = {
  newIncidentNotifier
};
