const authenticate = require('./login');
const checkNewEmails = require('./emailResponder');

async function main() {
  const auth = await authenticate();
  const randomNumber = Math.floor(Math.random() * (120 - 45 + 1)) + 45;

  setInterval(async () => {
    await checkNewEmails(auth);
  },randomNumber*1000);
}

main().catch((error) => {
  console.error('Error:', error);
});
