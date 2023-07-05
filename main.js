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
