const puppeter = require('puppeteer');
const twilio = require('twilio');

const accountSID = process.env.accountSID;
const authToken = process.env.authToken;
const phoneNumber = process.env.phoneNumber;
const notificationNumber = '+573116308815'; // Change this to your phone number

const sendNotification = async (message) => {
  const client = twilio(accountSID, authToken);

  try {
    await client.messages.create({
      body: message,
      from: phoneNumber,
      to: notificationNumber
    });
    console.log('Message sent');
  } catch (error) {
    console.log('Something went wrong', error);
  }
};

const awaitReload = new Promise((resolve) => {
  setTimeout(resolve, 20000);
  console.log('Waiting for 20 seconds');
  });

const checkIron = async () => {
  let isAvailable = false;
  const browser = await puppeter.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.ironman.com/im703-cartagena-register');

    while (!isAvailable) {
      const soldOutButton = await page.$('#pageEl_463149744');

      console.log('Checking for availability');

      if (!soldOutButton) {
        await sendNotification('Ironman Cartagena is open for registration');
        isAvailable = true;
      } else {
        // await page.waitForTimeout(5000); // Deprecated
        await awaitReload;
        await page.reload();
      }

      console.log('Checking again in 20 seconds');
    };

    await browser.close();
  } catch (error) {
    console.error('Something went wrong',error);
    await browser.close();
  }
};

checkIron();