import json
from run import slack_client

def send_message(recepient, message):
    slack_client.api_call(
        "chat.postMessage",
        channel=recepient,
        text=message,
        username='wire',
        icon_emoji=':robot_face:',
        as_user=True
    )
def send_attachment(recepient, message):
    slack_client.api_call(
        "chat.postMessage",
        channel=recepient,
        attachments=message,
        username='wire',
        icon_emoji=':robot_face:',
        as_user=True
    )

def send_log(recepient):
    with open('models/messages.json') as incident:    
        attachments = json.load(incident)
        slack_client.api_call(
            "chat.postMessage",
            channel=recepient,
            attachments=attachments,
            username='wire',
            icon_emoji=':robot_face:',
            as_user=True
        )
