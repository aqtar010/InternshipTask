require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs").promises;
const readline = require("readline");

//defining scopes of authentication
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "profile",
  "email",
  "https://www.googleapis.com/auth/gmail.labels",
];

async function getAccessToken(oAuth2Client) {
  //checking for an existing access token
  try {
    const token = await fs.readFile("token.json", "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
  //if not creating a new acess token
    return getNewAccessToken(oAuth2Client);
  }
}

async function getNewAccessToken(oAuth2Client) {
  //generating a url to do the oAuth2 verification
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    //creating a input interface to paste the genenrated code after the oauth2 verification
    rl.question("Enter the code from that page here: ", async (code) => {
      rl.close();
      try {
        //get the token by giving in the code
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        //writing the token for future use
        await fs.writeFile("token.json", JSON.stringify(tokens));
        //resolve promise by returning the auth
        resolve(oAuth2Client);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function authenticate() {
  //initiate google oAuth2 with required parameters
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URIS
    );
//calling fn to get the access token by passing new oAuth client
    return await getAccessToken(oAuth2Client);
  } catch (err) {
    console.error("Error loading client secret file:", err);
  }
}

module.exports = authenticate;
