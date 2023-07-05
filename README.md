
# Gmail Automated Response

This is a NodeJS project to send automated response to a new Unread email with in the primary category which are not threaded i.e which are not already replied to.


## pre-requisites
To run this application there are some prerequisites to be configured for this to work properly.
- Have [NodeJS](https://nodejs.org/en) installed on the machine.
- Have a working Google account and its Gmail ID
- Create a Developer project on [Google Developer Console](https://console.cloud.google.com/cloud-resource-manager) 
- Enable the [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com) for use.
- Create [Credentials](https://console.cloud.google.com/apis/credentials?)
- Create a [OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials/oauthclien)
- Configure the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?)
- Enable[ two factor auth](https://myaccount.google.com/security) and generate a coustom App Pass.
- Set the enviornment variables
- Create an empty token.json file in root directory

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`CLIENT_ID`: 
CLient ID generated after creating OAuth 2.0 Client ID

`CLIENT_SECRET`: 
CLient secret generated after creating OAuth 2.0 Client ID

`REDIRECT_URIS`:Authorized redirect URI set creating of OAuth 2.0 Client ID

`AUTH_USER_EMAIL_ID`:   Your Gmail ID

`APP_PASS`:App pass key generated 
## Run Locally

Clone the project

```bash
  git clone https://github.com/aqtar010/InternshipTask/
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```
Start the server

```bash
  npm run dev
```
Initial run will generate a link, copy the link and go to your logged in browser and complete the oAuth process

copy the code generated in the url and paste it onto the console and hit enter

Congrats you have your own nodejs Automated email respose application


## Tech Stack

**Server:** Node, Express, Nodemailer ,Googelapis

