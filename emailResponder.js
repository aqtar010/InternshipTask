require("dotenv").config()
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const authenticate = require("./login");

async function checkNewEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread -is:Vacation -from:me in:inbox category:primary after:2023/7/3 ",
    maxResults: 20,
  });
  const emails = res.data.messages;
  const resultSizeEstimate = res.data.resultSizeEstimate;

  if (resultSizeEstimate) {
    console.log(emails);
    for (const email of emails) {
      await processEmail(gmail, email.id, resultSizeEstimate);
    }
  } else {
    console.log("No new emails, checking again later");
  }
}
//processing new unread email
async function processEmail(gmail, emailId, resultSizeEstimate) {
  const res = await gmail.users.messages.get({ userId: "me", id: emailId });
  const email = res.data;
  const threadId = email.threadId;

  const subject = email.payload.headers.find(
    (header) => header.name === "Subject"
  ).value;

  const fromEmail = email.payload.headers.find(
    (header) => header.name === "From"
  ).value;

  const replyAddr = fromEmail
    .match(/<([^>]+)>/g)[0]
    .substring(1, fromEmail.match(/<([^>]+)>/g)[0].length - 1);
//Extracted the subject,from address
//and quering to 
  const replies = await gmail.users.messages.list({
    userId: "me",
    q: `in:inbox from:${replyAddr} subject:"${subject}"`,
  });
  if (replies.data.resultSizeEstimate < 2) {
    await sendReplyConstructor(gmail, email, threadId, replyAddr);
  }
}

async function sendReplyConstructor(gmail, email, threadId, replyAddr) {
  const authUser = process.env.AUTH_USER_EMAIL_ID; // Replace with your Gmail address

  const mailOptions = {
    from: authUser,
    to: replyAddr,
    subject: "Automatic Reply",
    text: "Thank you for your email. I am currently on vacation and will respond when I return.",
    threadId: threadId,
    replyTo: replyAddr,
  };

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
        sendReplyMail(transporter, mailOptions,replyAddr);
      }
    });

  await addLabelToEmail(gmail, email.threadId);
}

async function sendReplyMail(transporter, mailOptions,replyAddr) {
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending reply:", error);
    }else{
      console.log(`Automated reply Sent to ${replyAddr}`);
    }
  });
}

async function addLabelToEmail(gmail, threadId) {
  const labels = await gmail.users.labels.list({ userId: "me" });
  const labelExists = labels.data.labels.some(
    (label) => label.name === "Vacation"
  );
  console.log(labels.data.labels);
  if (!labelExists) {
    await gmail.users.labels.create({
      userId: "me",
      resource: { name: "Vacation" },
    });
  }

  await gmail.users.messages
    .get({ userId: "me", id: threadId })
    .then((result) => {
      if (!(result.data.labelIds.includes("Vacation"))) {
        modifyLabel(gmail, threadId);
      }
    });
}

async function modifyLabel(gmail, threadId) {
  await gmail.users.messages.modify({
    userId: "me",
    id: threadId,
    resource: {
      addLabelIds: ["Label_1"],
    },
  });
}
module.exports = checkNewEmails;
