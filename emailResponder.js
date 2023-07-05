require("dotenv").config();
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

//recieved auth from main program
//version: "v1": Specifies the version of the Gmail API to use, in this case, version 1.
//auth: Refers to the authentication configuration, which is likely an authenticated client instance used to authorize requests to the Gmail API.

async function checkNewEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  //querying for new unread primary mails which are no maore than 1 day old
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread -is:Vacation -from:me in:inbox category:primary newer_than:1d  ",
    maxResults: 20,
  });
  const emails = res.data.messages;
  const resultSizeEstimate = res.data.resultSizeEstimate;

  if (resultSizeEstimate) {
    //printing message ids and their thread Ids of the new emails which satisfy the above parameters
    console.log(emails);
    for (const email of emails) {
      //iterating over the email list to further process and curate a reply
      await processEmail(gmail, email.id, resultSizeEstimate);
    }
  } else {
    //if no new Emails print message
    console.log("No new emails, checking again later");
  }
}
//processing new unread email
async function processEmail(gmail, emailId, resultSizeEstimate) {
  //calling for the passed email data since only messageID was available
  const res = await gmail.users.messages.get({ userId: "me", id: emailId });
  const email = res.data;
  const threadId = email.threadId;
  //Retreiving the subject
  const subject = email.payload.headers.find(
    (header) => header.name === "Subject"
  ).value;
  //Retreving the From address
  const fromEmail = email.payload.headers.find(
    (header) => header.name === "From"
  ).value;
  //removing the other parts to get the from :Email address
  const replyAddr = fromEmail
    .match(/<([^>]+)>/g)[0]
    .substring(1, fromEmail.match(/<([^>]+)>/g)[0].length - 1);
  //getting the thread list to check if the thread length is more than 1 or not
  const replies = await gmail.users.messages.list({
    userId: "me",
    q: `in:inbox from:${replyAddr} subject:"${subject}"`,
  });
  if (replies.data.resultSizeEstimate < 2) {
    //if thread length is not more than 1 constructing a response email
    await sendReplyConstructor(gmail, email, threadId, replyAddr);
  }
}

async function sendReplyConstructor(gmail, email, threadId, replyAddr) {
  const authUser = process.env.AUTH_USER_EMAIL_ID; // Replace with your Gmail address
  //specifying mail options with from, to subject body,thread ID etc.
  const mailOptions = {
    from: authUser,
    to: replyAddr,
    subject: "Automatic Reply",
    text: "Thank you for your email. I am currently on vacation and will respond when I return.",
    threadId: threadId,
    replyTo: replyAddr,
  };
  //constructing a transporter for nodemailer library with service and credentials defined
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: authUser,
      pass: process.env.APP_PASS,
    },
  });

  await gmail.users.messages
    .get({ userId: "me", id: threadId })
    .then((result) => {
      if (result.data.labelIds.includes("Vacation")) {
        console.log("Already Replied to new mail");
      } else {
        sendReplyMail(transporter, mailOptions, replyAddr);
      }
    });
  //calling function for adding user defined lable the message
  await addLabelToEmail(gmail, email.threadId);
}

async function sendReplyMail(transporter, mailOptions, replyAddr) {
  //sending reply mail using the nodemailer with the specified mailOptions
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending reply:", error);
    } else {
      console.log(`Automated reply Sent to ${replyAddr} at time `, timeStamp());
    }
  });
}
let timeStamp = () => {
  // Create a new Date object
  let timestamp = new Date();

  // Get the individual components of the timestamp
  let year = timestamp.getFullYear();
  let month = timestamp.getMonth() + 1; // Note: Month starts from 0, so we add 1
  let day = timestamp.getDate();
  let hours = timestamp.getHours();
  let minutes = timestamp.getMinutes();
  let seconds = timestamp.getSeconds();

  // Format the timestamp
  let formattedTimestamp =
    year +
    "-" +
    padZero(month) +
    "-" +
    padZero(day) +
    " " +
    padZero(hours) +
    ":" +
    padZero(minutes) +
    ":" +
    padZero(seconds);

  return formattedTimestamp;
};
// Function to pad single digits with leading zeros
function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}

async function addLabelToEmail(gmail, threadId) {
  //getting the lable list to check if the lable to be created already defined or not
  const labels = await gmail.users.labels.list({ userId: "me" });
  const labelExists = labels.data.labels.some(
    (label) => label.name === "Vacation"
  );

  if (!labelExists) {
    //if lable does not already exist then creating a new lable
    await gmail.users.labels.create({
      userId: "me",
      resource: { name: "Vacation" },
    });
  }
  //if lable already exist or not ,checking to see if the lable list of the message
  //to see if it already has the to be defined lable or not
  await gmail.users.messages
    .get({ userId: "me", id: threadId })
    .then((result) => {
      if (!result.data.labelIds.includes("Vacation")) {
        //if not modify the lable list of the message
        modifyLabel(gmail, threadId);
      }
    });
}

async function modifyLabel(gmail, threadId) {
  // modify the lable list of the message to add user created lable
  await gmail.users.messages.modify({
    userId: "me",
    id: threadId,
    resource: {
      addLabelIds: ["Label_1"],
    },
  });
}
module.exports = checkNewEmails;
