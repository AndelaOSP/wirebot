import json
import os

from ast import literal_eval
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, Response
from slackclient import SlackClient

import services

load_dotenv(find_dotenv())
# Flask Variables
HOST = os.environ.get('HOST') or '127.0.0.1'
PORT = os.environ.get('PORT') or 4040

# Slack Variables
BOT_TOKEN = os.environ.get('BOT_TOKEN')
slack_client = SlackClient(BOT_TOKEN)
BOT = slack_client.api_call('auth.test')

print(BOT)

app = Flask(__name__)

incident_category = None

@app.route('/events', methods=['GET', 'POST'])
def events():
    global incident_category
    challenge = request.json.get('challenge')
    if services.get_sender(request.json) == BOT['user_id']:
        return Response(response='ok', 
                    status=200, 
                    headers={'X-Slack-No-Retry': 1}
                    )
    if challenge: 
        return Response(json.dumps({'challenge': challenge}))
    elif incident_category is None:
        services.dispatch(request.json)
        return Response(response='ok', 
                    status=200, 
                    headers={'X-Slack-No-Retry': 1}
                    )
    else:
        services.save_incident(incident_category, request.json)
        incident_category = None
        return Response(response='ok', 
                    status=200, 
                    headers={'X-Slack-No-Retry': 1}
                    )

@app.route('/messages', methods=['GET', 'POST'])
def messages():
    global incident_category
    data = json.loads(request.form['payload'])
    callback_id = data[u'callback_id']
    if callback_id == 'category':
        incident_category = data['actions'][0][u'selected_options'][0][u'value']
    return Response(response='Describe The Incident', 
                    status=200, 
                    headers={'X-Slack-No-Retry': 1}
                    )


def main():
    app.debug=True
    app.run(HOST, int(PORT))

if __name__ == "__main__":
    main()