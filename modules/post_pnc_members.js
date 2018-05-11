const axios = require('axios');
const dotenv = require('dotenv');
const SlackClient = require('@slack/client').WebClient;

const { logError } = require('./error_logger');

dotenv.load();

const sc = new SlackClient(process.env.SLACK_BOT_TOKEN);

const apiBaseUrl = process.env.API_BASE_URL;
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const people_new_york = process.env.SLACK_PEOPLE_NEW_YORK;
const people_lagos = process.env.SLACK_PEOPLE_LAGOS;
const people_nairobi = process.env.SLACK_PEOPLE_NAIROBI;
const people_kampala = process.env.SLACK_PEOPLE_KAMPALA;

const peopleCultureChannels = {
  newYork: people_new_york,
  lagos: people_lagos,
  nairobi: people_nairobi,
  kampala: people_kampala
};

const slackUserLocation = (location) => {
  switch(location) {
  case 'newYork':
    return {
      name: 'Office',
      centre: 'New York',
      country: 'USA'
    };
  case 'lagos':
    return {
      name: 'Office',
      centre: 'EPIC Tower',
      country: 'Nigeria'
    };
  case 'nairobi':
    return {
      name: 'Office',
      centre: 'St. Catherines',
      country: 'Kenya'
    };
  case 'kampala':
    return {
      name: 'Office',
      centre: 'Kampala',
      country: 'Uganda'
    };
  }
};

const postPnCMembers = () => {
  for(let locationName in peopleCultureChannels) {
    if (peopleCultureChannels.hasOwnProperty(locationName)) {
      let peopleCultureChannelId = peopleCultureChannels[locationName];
      let formattedPeopleCultureChannelId = peopleCultureChannelId.trim();

      sc.groups.info(formattedPeopleCultureChannelId)
        .then(groupDetails => {
          groupDetails.group.members.map(member => {
            sc.users.info(member)
              .then(memberDetails => {
                if (memberDetails.user.is_bot === false) {
                  if (memberDetails.user.deleted === true) {
                  // POST to delete? API endpoint
                  }

                  axios.post(`${apiBaseUrl}/users`, {
                    userId: memberDetails.user.id,
                    email: memberDetails.user.profile.email,
                    username: memberDetails.user.profile.real_name_normalized,
                    imageUrl: memberDetails.user.profile.image_48,
                    roleId: 2,
                    location: slackUserLocation(locationName)
                  }).catch(err => {
                    logError(err);
                  });
                }
              }).catch(err => {
                logError(err);
              });
          });
        }).catch(err => {
          logError(err);
        });
    }
  }

  axios.post(slackWebhookUrl, {
    'username': 'wirebot',
    'icon_emoji': ':slightly_smiling_face:',
    'text': 'Cron job completed'
  }).catch(err => {
    logError(err);
  });
};

module.exports = {
  postPnCMembers
};
