const puppeter = require('puppeteer');
const twilio = require('twilio');
require('dotenv').config();

const accountSID = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const phoneNumber = process.env.PHONE_NUMBER;
const notificationNumber1 = process.env.NOTIFICATION_NUMBER_1;
const notificationNumber2 = process.env.NOTIFICATION_NUMBER_2;

const sendNotification = async (message, notificationNumber) => {
  const client = twilio(accountSID, authToken);

  try {
    await client.messages.create({
      body: message,
      from: phoneNumber,
      to: notificationNumber
    });
    console.log(`Message sent to ${notificationNumber}`);
  } catch (error) {
    console.log('Something went wrong', error);
  }
};

const sendNotificationCall = async (notificationNumber) => {
  const client = twilio(accountSID, authToken);

  try {
    await client.calls.create({
      twiml: '<Response><Say>Ahoy, Ironman Cartagena is open for registration!</Say></Response>',
      to: notificationNumber,
      from: phoneNumber
    }, function(err, call) {
      if (err) {
        console.log(err);
      } else {
        console.log(call.sid);
      }
    });
    console.log(`Call sent to ${notificationNumber}`);
  } catch (error) {
    console.log('Something went wrong', error);
  }
};

const awaitReload = new Promise((resolve) => {
  setTimeout(resolve, 50000);
  console.log('Waiting for 50 seconds');
  });

const checkIron = async () => {
  let isAvailable = false;
  const browser = await puppeter.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.ironman.com/im703-cartagena-register');

    while (!isAvailable) {
      const soldOutButton = await page.$('#pageEl_463149744');
      const registerButton = await page.$('#yieldContent > div.race-page-top > div.race-band.active > div.linkElement > h4 > a');

      console.log('Checking for availability');

      if (!soldOutButton || !registerButton) {
        await sendNotification('Ironman Cartagena is open for registration', notificationNumber1);
        await sendNotificationCall(notificationNumber2);
        isAvailable = true;
      } else {
        await new Promise((resolve) => {
          setTimeout(resolve, 50000);
          console.log('Waiting for 50 seconds');
        });
        console.log('Checking again in 50 seconds');
        await page.reload();
      }
    };

    console.log('Contratulations, you can register now');
    await browser.close();
  } catch (error) {
    console.error('Something went wrong',error);
    await browser.close();
  }
};

checkIron();