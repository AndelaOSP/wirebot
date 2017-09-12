import re
import requests
from services import message
import datetime

last_event_time = 0

commands = {
    'log': re.compile(r'(log incident)', re.IGNORECASE)
}

def get_sender(event):
    if u'message' in event[u'event'].keys():
        return event[u'event'][u'message'][u'user']
    return event['event']['user']

def get_message(event):
    return event['event']['text']

def is_repeat_event(event):
    global last_event_time
    current_time = event['event']['event_ts']
    if current_time > last_event_time:
        last_event_time = current_time
        return False
    else:
        return True

def match_command(command, text):
     return re.search(command, text)

def dispatch(event):
    if(is_repeat_event(event)):
        print('repeat')
        return
    else:
        message_text = get_message(event)
        if (match_command(commands['log'], message_text)):
            # message.send_message(get_sender(event), 'test message')
            message.send_log(get_sender(event))

def save_incident(category, event):
    print(category)
    print(event)
    incident = {
        "date_occurred": datetime.datetime.now().__str__(),
        "description": event[u'event'][u'text'],
        "category_id": 1,
        "location_id": 1
    }
    r = requests.post('http://app.nairobi.us/wire/api/incidents', data = incident)
    if r.status_code == 200:
        data = requests.get('http://app.nairobi.us/wire/api/incidents/{0}'\
                                                .format(r.json().get(u'id')))
        data = data.json()
        incident = [{
            "pretext": "Incident Logged",
            "text": "Category: {0} \nDescription: {1} \nStatus: {2}"\
                                        .format(data[u'category_name'], 
                                                data[u'description'], 
                                                data[u'status']),
            "color": "#3359DF"
        }]
        message.send_attachment(get_sender(event), incident)
        print(r.json())
    else:
        print(r.text)
        message.send_message(get_sender(event), 'Ooops! We may have to try this again later')


