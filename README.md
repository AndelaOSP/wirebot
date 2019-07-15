# wirebot

[![Test Coverage](https://api.codeclimate.com/v1/badges/366efe7c8d9494bd82e8/test_coverage)](https://codeclimate.com/github/AndelaOSP/wirebot/test_coverage) [![CircleCI](https://circleci.com/gh/AndelaOSP/wirebot.svg?style=svg)](https://circleci.com/gh/AndelaOSP/wirebot)

WIREBOT consumes [WIRE-API](https://github.com/AndelaOSP/wire-api)

# Getting Started
### Prerequisites
Ensure you have the following installed locally:
- [Node](https://nodejs.org/en/) v9+

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

## Slack App Configuration

Get started by [creating a Slack App](https://api.slack.com/apps/new) if you haven't already.

*PS:* You can only add the `Slack-App` to a workspace, with which you have `admin access`, You can create a new one for testing.

On the **Basic Information** page, in the section for **App Credentials**, note the **Verification Token** (we will add it to our `.env` file).

On the the **Oauth & Permissions** page on the dashboard,
- In the section for **OAuth Settings** note the **OAuth Access Token**
- Scroll down to the **Scopes** - **Select Permission Scopes** section and add the following permissions to your app
  - `commands`
  - `users:read`
  - `users:read.email`
  - `users.profile:read`
  - `channels:read`
  - `chat:write:bot`
  - `chat:write:user`
  - `groups:read`
  - `groups:write`
  - `incoming-webhook`
  - `usergroups:write`
  - `team:read`
- Click on `Save Changes`

---

ngrok Setup

At this point make sure the `wire-api` & `wire-bot` are running locally, we will need our created `Slack-App` to be able to communicate with our local `wire-bot` server.

- To do this we will need [ngrok](https://ngrok.com/). Follow this [links'](https://dashboard.ngrok.com/get-started) instructions to install `ngrok` on your computer.

- Start `ngrok` with this command ``` ngrok http 3001 ``` ie `3001` is the port on which the `wire-bot` server is running.

- When `ngrok` runs, Copy the `Forwarding url` that is logged on the console (we will be needing it as we continue setting up the `Slack-App`)

- *PS:* the provided ngrok url is new on every restart of `ngrok`, you will need to update where its used everytime you restart `ngrok`.

---

On the **Interactive Components** page,
- Enable **interactivity**.
- Input a **Request URL**. The request url would be https://**Your-github-username**.serveo.net/slack/actions in development or you can use: http://`Forwarding url`/slack/actions

---

On the **Slash Commands** page,
- click create a new **slash command**
  - command `/report`
  - request url *https://`Forwarding url`/slack/report*
  - fill in other details for your command.
  - save your changes

---

Add a BOT User,

- On the **BOT Users** page
- Create a new BOT user (give the BOT user a name & username then save changes).
- *PS:* This will require you to  re-install the  app to the  workspace to add these changes.

After the BOT User has been created

- On the **OAuth & Permissions** page.
- Copy the `Bot User OAuth Access Token`, it will be set in our `.env` file as the *SLACK_TOKEN*.
---

![Configuring a request URL](https://github.com/slackapi/node-slack-interactive-messages/blob/master/support/interactive-components.gif)

---

### Run WIREBOT locally
- Create a **.env** file and configure your environment variables using the **.env.sample** file in the root directory of the repository

- Start the bot server locally:
  ```sh
  npm run start:dev
  ```
- You can now communicate with the bot via Slack using the slash command below
  - `/report` for reporting incidents.

# Testing New Branches
To test a new branch prior to merging a pull request:
- Run `npm test`
- **_Testing framework setup in progress_**

# Authors
- [Ian King'ori](https://github.com/andela-ik)
- [Batian Muthoga](https://github.com/bmuthoga)
- [Kisakye Gordon](https://github.com/kisakyegordon)

# License
This project is licensed under the MIT License.
