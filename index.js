const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
const slackInteractiveMessages = require('@slack/interactive-messages');
const { createSlackEventAdapter } = require('@slack/events-api');
const SlackClient = require('@slack/client').WebClient;
const dotenv = require('dotenv');
const moment = require('moment');
const { isLocationValid } = require('./modules/validation/location_validation');
const {
  isDescriptionAdequate
} = require('./modules/validation/description_validation');
const {
  isSubjectAdequate
} = require('./modules/validation/subject_validation');
const { isWitnessValid } = require('./modules/validation/witnesses_validation');
const {
  isDateValid,
  isDateFuture
} = require('./modules/validation/date_validation');
const { levelId } = require('./modules/levels');
const {
  initiationMessage,
  categoryMessage,
  witnessesMessage,
  getConfirmationMessage
} = require('./modules/messages');
const actions = require('./modules/actions');
const { slackUserLocation } = require('./modules/location_centres');

dotenv.load();

const { logError } = require('./modules/error_logger');

const slackChannels = process.env.SLACK_CHANNELS;
const apiBaseUrl = process.env.API_BASE_URL;
const slackEvents = createSlackEventAdapter(
  process.env.SLACK_VERIFICATION_TOKEN
);
const sc = new SlackClient(process.env.SLACK_BOT_TOKEN);
const slackMessages = slackInteractiveMessages.createMessageAdapter(
  process.env.SLACK_VERIFICATION_TOKEN
);
const port = process.env.PORT || 3000;

const confirmIncident = (user, channel) => {
  const data = actions.tempIncidents[user];
  sc.chat.postMessage(channel, '', getConfirmationMessage(data), err => {
    if (err) {
      logError(err);
    }
  });
};

slackEvents.on('message', event => {
  // do not respond to edited messages or messages from me
  if (event.subtype === 'bot_message' || event.subtype === 'message_changed') {
    return;
  }

  const userId = event.user;
  if (!actions.tempIncidents[userId]) {
    sc.chat.postMessage(event.channel, '', initiationMessage, err => {
      if (err) {
        logError(err);
      }
    });
  } else {
    const currentStep = actions.tempIncidents[userId].step;
    switch (currentStep) {
    case 0:
      if (isSubjectAdequate(event.text)) {
        sc.chat.postMessage(
          event.channel,
          'Kindly try to keep incident subject under 10 words',
          err => {
            if (err) {
              logError(err);
            }
          });

        break;
      }

      actions.saveSubject(event);
      sc.chat.postMessage(
        event.channel,
        'When did the incident occur? (dd-mm-yy)',
        err => {
          if (err) {
            logError(err);
          }
        }
      );

      break;
    case 1:
      if (isDateValid(event.text) === false) {
        sc.chat.postMessage(
          event.channel,
          'You cannot report a future incident or Invalid date entered (dd-mm-yy)',
          err => {
            if (err) {
              logError(err);
            }
          }
        );

        break;
      }

      if (isDateFuture(event.text) === true) {
        sc.chat.postMessage(
          event.channel,
          'You cannot report a future incident or Invalid date entered (dd-mm-yy)',
          err => {
            if (err) {
              logError(err);
            }
          }
        );

        break;
      }

      actions.saveDate(event);
      sc.chat.postMessage(
        event.channel,
        'Where did this happen? (place, city, country)',
        err => {
          if (err) {
            logError(err);
          }
        }
      );
      break;
    case 2:
      if (isLocationValid(event.text) === false) {
        sc.chat.postMessage(
          event.channel,
          'The location should be in the format \'place, city, country\'',
          err => {
            if (err) {
              logError(err);
            }
          }
        );

        break;
      }

      actions.saveLocation(event);
      sc.chat.postMessage(event.channel, '', categoryMessage, err => {
        if (err) {
          logError(err);
        }
      });
      break;
    case 3:
      console.log('Logic flaw??'); // eslint-disable-line no-console
      break;
    case 4:
      if (isDescriptionAdequate(event.text) === false) {
        sc.chat.postMessage(
          event.channel,
          'Kindly add a bit more description of the incident',
          err => {
            if (err) {
              logError(err);
            }
          }
        );

        break;
      }

      actions.saveDescription(event);
      sc.chat.postMessage(event.channel, '', witnessesMessage, err => {
        if (err) {
          logError(err);
        }
      });
      break;
    case 5:
      if (isWitnessValid(event.text) === false) {
        sc.chat.postMessage(
          event.channel,
          'Kindly ensure all witnesses\' Slack handles are in valid format and correct',
          err => {
            if (err) {
              logError(err);
            }
          }
        );

        break;
      }

      actions.saveWitnesses(event);
      confirmIncident(event.user, event.channel);
      break;
    case 6:
      break;
    }
  }
});

slackMessages.action('report', (payload, respond) => {
  actions.start(payload, respond);
  return {
    text: 'Just a sec'
  };
});

slackMessages.action('category', (payload, respond) => {
  actions.saveCategory(payload, respond);
  return {
    text: 'Just a sec'
  };
});

slackMessages.action('confirm', (payload, respond) => {
  const selected = payload.actions[0].value;

  if (selected ==='cancel') {
    const userId = payload.user.id;
    delete actions.tempIncidents[userId];
    return respond({'text': 'Ok, let me know if you change your mind :smiley:'});
  }

  let incidentReporter = payload.user.id;
  let incidentSummary = actions.tempIncidents[incidentReporter];
  let location_array = incidentSummary.location.split(',');
  let formatted_witnesses_promises = [];  

  if (incidentSummary.witnesses.length) { 
    let witnesses = incidentSummary.witnesses.split(',');
    formatted_witnesses_promises = witnesses.map(witness => {
      let formatted_witness = witness.replace(/<|>|@/g, '').trim();

      return sc.users.info(formatted_witness)
        .then(result => {
          return {
            userId: result.user.id,
            email: result.user.profile.email,
            username: result.user.profile.real_name_normalized,
            imageUrl: result.user.profile.image_48,
            witnessLocation: slackUserLocation(result.user.tz)
          };
        }).catch(error => {
          logError(error);
        });
    });
  }

  Promise.all(formatted_witnesses_promises).then(formatted_witnesses => {
    sc.users.info(payload.user.id)
      .then(result => {
        axios.post(`${apiBaseUrl}/incidents`, {
          subject: incidentSummary.subject,
          description: incidentSummary.description,
          dateOccurred: incidentSummary.date,
          levelId: levelId(incidentSummary.category),
          incidentReporter: {
            userId: result.user.id,
            email: result.user.profile.email,
            username: result.user.profile.real_name_normalized,
            imageUrl: result.user.profile.image_48,
            reporterLocation: slackUserLocation(result.user.tz)
          },
          location: {
            name: location_array[0].trim(),
            centre: location_array[1].trim(),
            country: location_array[2].trim()
          },
          witnesses: formatted_witnesses
        })
          .then((result) => {
            let tagged_witnesses = result.data.data.witnesses;
            tagged_witnesses.map(tagged_witness => {
              sc.im.list().then(success => {
                success.ims.map(im => {
                  if (im.user === tagged_witness.id) {
                    sc.chat.postMessage(
                      im.id, '', {
                        attachments: [
                          {
                            'color': '#36a64f',
                            'pretext': `<@${incidentReporter}> reported an incident and tagged you as a witness`,
                            'fields': [
                              {
                                'title': 'Subject',
                                'value': result.data.data.subject
                              },
                              {
                                'title': 'Location',
                                'value': `${result.data.data.Location.name}, ${result.data.data.Location.centre}, ${result.data.data.Location.country}`
                              },
                              {
                                'title': 'Date Occurred',
                                'value': moment(result.data.data.dateOccurred).format('DD MMMM, YYYY')
                              }
                            ]
                          }
                        ]
                      },
                      err => {
                        if (err) {
                          logError(err);
                        }
                      }
                    );
                  }
                });
              }).catch(error => {
                logError(error);
              });
            });
            
            payload.incidentId = result.data.data.id;
            actions.saveIncident(payload, respond);
          })
          .catch((err) => {
            respond({
              text: 'Something didn\'t quite work. Try again.'
            });
            confirmIncident(payload.user.id, payload.channel.id);

            logError(err);
          });

      }).catch(error => {
        logError(error);
      });
  });
});

slackMessages.action('witnesses', (payload, respond) => {
  const selected = payload.actions[0].value;
  if (selected === 'no') {
    // show confirmation
    const event = {
      user: payload.user.id,
      text: ''
    };
    actions.saveWitnesses(event);
    confirmIncident(payload.user.id, payload.channel.id);
  } else {
    respond({ text: 'Who are your witnesses? (@witness1, @witness2)' });
  }
  return {
    text: 'Just a sec'
  };
});

const peopleCultureChannels = slackChannels.split(',');

cron.schedule('0 22 * * 1', function() {
  peopleCultureChannels.map(peopleCultureChannel => {
    let formattedPeopleCultureChannel = peopleCultureChannel.trim();

    sc.groups.info(formattedPeopleCultureChannel)
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
                  location: slackUserLocation(memberDetails.user.tz)
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
  });  
});

// Start a basic HTTP server
const app = express();
app.use(bodyParser.json());
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());
// Start the server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`); // eslint-disable-line no-console
});
