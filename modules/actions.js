const tempIncidents = {};

const start = (payload, respond) => {
  console.log(payload);
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
    return respond({'text': "What is the subject of the incident?"});
  }
  
}

const saveSubject = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  //TODO: add subject validation 
  tempIncidents[userId].subject = message;

}

const saveDate = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  //TODO: add message validation
  tempIncidents[userId].date = message;

}

const saveLocation = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].step += 1;
  //TODO:location validation
  tempIncidents[userId].location = message;

}

const saveCategory = (payload, respond) => {
  const userId = payload.user.id;
  tempIncidents[userId].category = payload.actions[0].value;
  tempIncidents[userId].step += 1;
  return respond({'text': 'Okay, What happened?'})
}

const saveDescription = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].description = message;
  tempIncidents[userId].step += 1;
}

const saveIncident = (payload, respond) => {
  //TODO: hit api
  const userId = payload.user.id;
  delete tempIncidents[userId];
  return respond({text: 'Incident number: WX5667F'});
}

const saveWitnesses = (event) => {
  const userId = event.user;
  const message = event.text;
  tempIncidents[userId].witnesses = message;
  tempIncidents[userId].step += 1;
  console.log(tempIncidents);
}

module.exports = {
  start,
  tempIncidents,
  saveSubject,
  saveDate,
  saveLocation,
  saveCategory,
  saveDescription,
  saveIncident,
  saveWitnesses
}