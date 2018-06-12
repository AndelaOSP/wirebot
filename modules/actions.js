const { categoryMessage } = require('./messages');
const { incidentHandlerVerification } = require('./incident_handler_verification');
const { logError } = require('./error_logger');

const tempIncidents = {};

const start = (payload, respond) => {
  const selected = payload.actions[0].value;
  const userId =  payload.user.id;
  if(selected === 'no') {
    return respond({'text': 'Ok, let me know if you change your mind :smiley:'});
  } else if(tempIncidents[userId]) {
    return respond({'text': 'we already started your case'});
  } else {
    tempIncidents[userId] = {
      step: 0
    };
    return respond({'text': 'What is the subject of the incident?'});
  }

};

const saveSubject = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  //TODO: add subject validation
  tempIncidents[userId].subject = message;

};

const saveDate = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  //TODO: add message validation
  tempIncidents[userId].date = message;

};

const saveSelectedLocation = (payload, respond) => {
  const userId = payload.user.id;

  switch(payload.actions[0].name) {
    case 'location':
      tempIncidents[userId].location = payload.actions[0].selected_options[0].value;
      break;
    case 'submit':
      if (!tempIncidents[userId].location) {
        break;
      } else {
        if (tempIncidents[userId].location === 'Other') {
          respond({
            text: 'Where did this happen? (place, city, country)'
          }).catch(error => {
            logError(error);
          });

          tempIncidents[userId].step += 1;
          break;
        } else {
          tempIncidents[userId].incidentHandler = incidentHandlerVerification(tempIncidents[userId].location);
          tempIncidents[userId].step += 3;

          respond(categoryMessage).catch(error => {
            logError(error);
          });
          break;
        }
      }
  }
};

const saveTypedLocation = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  tempIncidents[userId].location = message;

};

const saveLocationHandler = (payload, respond) => {
  const userId = payload.user.id;

  switch(payload.actions[0].name) {
    case 'select_location':
      tempIncidents[userId].incidentHandler = payload.actions[0].selected_options[0].value;
      break;
    case 'submit':
      if (!tempIncidents[userId].incidentHandler) {
        break;
      } else {
        tempIncidents[userId].step += 1;
        respond(categoryMessage).catch(error => {
          logError(error);
        });
        break;
      }
  }
};

const saveCategory = (payload, respond) => {
  const userId = payload.user.id;
  tempIncidents[userId].category = payload.actions[0].value;
  tempIncidents[userId].step += 1;
  return respond({'text': 'Okay, What happened?'});
};

const saveDescription = (event) => {
  const userId = event.user;
  const message = event.text;
  if (!tempIncidents[userId].description) {
    tempIncidents[userId].description = message;
  } else {
    tempIncidents[userId].description += ' ' + message;
  }

  tempIncidents[userId].step += 1;
};

const saveIncident = (payload, respond) => {
  //TODO: hit api
  const userId = payload.user.id;
  delete tempIncidents[userId];
  return respond({text: `Incident reported successfully. Your incident number is \`${payload.incidentId}\``});
};

const saveWitnesses = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].witnesses = message;
  tempIncidents[userId].step += 1;
};

module.exports = {
  start,
  tempIncidents,
  saveSubject,
  saveDate,
  saveSelectedLocation,
  saveTypedLocation,
  saveLocationHandler,
  saveCategory,
  saveDescription,
  saveIncident,
  saveWitnesses
};
