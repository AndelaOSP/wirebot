# wirebot

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

On the **Basic Information** page, in the section for **App Credentials**, note the **Verification Token**. 

On the the **Oauth & Permissions** page on the dashboard,
- In the section for **OAuth Settings** note the **OAuth Access Token** 
- Scroll down to the **Scopes** - **Select Permission Scopes** section and add the following permissions to your app
  - `commands`
  - `users:read`
  - `users:read.email`
  - `users.profile:read`
- Click on `Save Changes`

On the **Interactive Components** page, 
- Enable **interactivity**.
- Input a **Request URL**. The request url would be https://**Your-github-username**.serveo.net/slack/actions in development or https://**your-server-url**/slack/actions

On the **Slash Commands** page, 
- click create a new **slash command** 
  - command `/report`
  - request url `https://replace-the-server-url/slack/report`
  - fill in other details for your command.
  - save your changes

![Configuring a request URL](https://github.com/slackapi/node-slack-interactive-messages/blob/master/support/interactive-components.gif)


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

# License
This project is licensed under the MIT License.
