const fs = require('fs');
const {google} = require('googleapis');
const utils = require('./utils.js');
const paymentUtils = require('./payment-utils.js');
const orderUtils = require('./order-utils.js');
const { ChatBot } = require('./chat-bot.js');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const readline = require('readline');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), consumeResults);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Open the wing response spreadsheet and parse the results into objects
 * https://docs.google.com/spreadsheets/d/1WH7rF44Z0-swAqMeyQqamKBWATIrCCk_ml9XyN8-7sU/edit#gid=1558653135
 */
async function consumeResults(auth) {
  // Slackbot client
  const bot = new ChatBot();
  await bot.postOrderForm();

  // Pause until everyone is done ordering
  readlineSync.question('Please press enter when all orders are in\n');

  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1WH7rF44Z0-swAqMeyQqamKBWATIrCCk_ml9XyN8-7sU',
    range: 'Form Responses 1!A2:K',
  }, async (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    const everyone = [];
    if (rows.length) {
      rows.forEach((row) => {
        everyone.push(utils.parseRow(row));
      });
    } else {
      console.log('No data found.');
    }

    // Log Orders
    console.log(chalk.bgRed('Orders'));
    console.table(everyone);

    // Order
    const page = await orderUtils.order(everyone);
    paymentUtils.printPayment(everyone);

    // Post slack updates
    bot.waitForOrderPage(page, async () => {
      await bot.postReceipt(page);

      await bot.postPaymentInfo();

      await bot.startOrderMonitoring(page);

      console.log("Finished, you can close me now");
    });
  });
}