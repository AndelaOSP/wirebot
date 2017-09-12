import re
from services import message

last_event_time = 0

commands = {
    'log': re.compile(r'(log incident)', re.IGNORECASE)
}

def get_sender(event):
    print(event)
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


