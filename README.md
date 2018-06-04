# wirebot

WIREBOT consumes [WIRE-API](https://github.com/AndelaOSP/wire-api)

# Getting Started
### Prerequisites
Ensure you have the following installed locally:
- [Node](https://nodejs.org/en/)
- [Ngrok](https://ngrok.com/)
- [Yarn](http://yarnpkg.com/)

### Installing
Clone this git repository:
```sh
$ git clone https://github.com/AndelaOSP/wirebot.git
```
Navigate into the root of the cloned directory:
```sh
$ cd wirebot
```
Install all dependencies:
```sh
$ yarn
```

### Configuring the Slack App
- Rename `.env.example` to `.env`
- Head over to [Slack](https://slack.com) and Sign in or create a workspace
- Navigate to [Slack API](https://api.slack.com/) and click `Start Building`
- Fill in the `App Name` and assign it to the appropriate `Slack Workspace`
- After creating the app, select `Basic Information` on the left menu, scroll down to `Verification Token`, copy and assign its value to `SLACK_VERIFICATION_TOKEN` in your `.env`
- Select `Bot Users` on the left menu and add a bot user
- Next select `Install App` and proceed to install the app on the workspace. New OAuth tokens will be generated. Copy the `Bot User OAuth Access Token` and assign it to the `SLACK_BOT_TOKEN` in your `.env`
- Head over to `OAuth and Permissions`, scroll down to `Scopes` and add the following permission scopes: `chat:write:bot` and `chat:write:user`

### Run WIREBOT
Start the bot server locally:
```sh
node index.js
```
Tunnel the port the server is running on(`3000` is the default port the server runs on):
```sh
ngrok http 3000
```
The output will be similar to the below:
```sh
ngrok by @inconshreveable                                                            (Ctrl+C to quit)

Session Status                online
Session Expires               7 hours, 58 minutes
Version                       2.2.8
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://26adcd24.ngrok.io -> localhost:3000
Forwarding                    https://26adcd24.ngrok.io -> localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

Copy the `SSL secured url`. Head back to the Slack App Manager.
Select `Interactive Components` and click `Enable Interactive Components`. In the `Request URL` field, paste the copied url and add `/slack/actions` and `Enable Interactive Components`. Below is an example of how the url should look like:
```sh
https://26adcd24.ngrok.io/slack/actions
```

Head to `Event Subscriptions` and `Enable Events`. 
In the `Request URL` field, paste the copied url similar to above and add `/slack/events`. Below is an example of how the url should look like:
```sh
https://26adcd24.ngrok.io/slack/events
```
Scroll down to `Subscribe to Bot Events` and add the following bot events: `message.im`, `message.mpim`, `message.channels` and `message.groups`. Click `Save Changes`.

You can now communicate with the bot via Slack direct messages, channels or groups.

# Testing New Branches
To test a new branch prior to merging a pull request:
- Checkout to the new branch
- Start the bot server and tunnel the port as shown above under **Run WIREBOT**
- Change the `Request URLs` for `Interactive Components` and `Event Subscriptions` to the new SSL secured url provided by **Ngrok**
- Communicate with the bot via Slack to test out the new feature(s)
- **_Testing framework setup in progress_**

# Authors
- [Ian King'ori](https://github.com/andela-ik)
- [Batian Muthoga](https://github.com/bmuthoga)

# License
This project is licensed under the MIT License.
