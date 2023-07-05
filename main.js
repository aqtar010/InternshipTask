const authenticate = require('./login');
const checkNewEmails = require('./emailResponder');

async function main() {
  //authenticating the user 
  const auth = await authenticate();
//after authentication checking emails at random intervals of 45-120 seconds
  setInterval(async () => {
    await checkNewEmails(auth);
  },(Math.floor(Math.random() * (120 - 45 + 1)) + 45)*1000);
}

main().catch((error) => {
  console.error('Error:', error);
});












/*
Future optimizations:
This application is not totally secure,one thing is to look in to the security
it commucates with the gmail api many time , this should be looked into 
getting unnessary data during an api call
there may be a better approach than applied here
*/
