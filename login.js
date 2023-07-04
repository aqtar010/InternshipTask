require("dotenv").config()
const { google } = require("googleapis");
const fs = require("fs").promises;
const readline = require("readline");

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify",'profile','email',"https://www.googleapis.com/auth/gmail.labels"];

async function getAccessToken(oAuth2Client) {
  try {
    const token = await fs.readFile("token.json", "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewAccessToken(oAuth2Client);
  }
}

async function getNewAccessToken(oAuth2Client) {
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
    rl.question("Enter the code from that page here: ", async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        await fs.writeFile("token.json", JSON.stringify(tokens));
        resolve(oAuth2Client);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function authenticate() {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URIS
    );

    return getAccessToken(oAuth2Client);
  } catch (err) {
    console.error("Error loading client secret file:", err);
  }
}

module.exports = authenticate;
