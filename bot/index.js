const paymentUtils = require('./payment-utils.js');
const orderUtils = require('./order-utils.js');
const { ChatBot } = require('./chat-bot.js');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const utils = require('./utils.js');

async function main() {
  // Slackbot client
  const bot = new ChatBot();

  const pord = readlineSync.question('1. Delivery (default)\n2. Pickup\n');
  const delivery = pord !== "2";

  console.log(`Staring a ${delivery ? 'delivery' : 'pickup'} order`);
  console.log('Waking up heroku dyno. This may take a bit...');

  await utils.wakeUp();
  let thread_ts = await utils.getCurrentThread();

  if (thread_ts) {
    console.log('Resuming previous order.');
    bot.setThreadTs(thread_ts);
  } else {
    thread_ts = await bot.postOrderForm();
    console.log(`Starting a new order with ${thread_ts}`);
    await utils.createNewThread(thread_ts);
  }

  // Pause until everyone is done ordering
  readlineSync.question('Please press enter when all orders are in\n');

  let everyone = await utils.getOrders(thread_ts);

  // Log Orders
  console.log(chalk.bgRed('Orders'));
  console.table(everyone, ['name', 'item', 'price', 'sauces', 'dressing', 'fries', 'complete']);

  // Validate everyone's order is complete
  if (everyone.some(o => !o.complete)) {
    throw new Error('There is an incomplete order.');
  }

  // Order  
  const page = await orderUtils.order(everyone, delivery);

  await orderUtils.logIn(page);

  await orderUtils.grabReceipt(page, thread_ts);

  const tax = await orderUtils.getTax(page);

  await orderUtils.tip(page);

  const payments = paymentUtils.generatePayment(everyone, tax, delivery);

  // Print total for sanity checking
  console.log(chalk.bgRed('Payments'));
  console.table(payments);
  let total = 0;
  payments.forEach(p => (total += p.total));
  console.log(`Total tax: ${tax}`);
  console.log(chalk.bgRed(`total: ${total}`));

  // Pause until I've actually placed the order
  readlineSync.question('Please press enter when order is placed\n');

  await bot.atMentionEveryone(everyone);

  // await bot.postOrderPreparation(page);

  await bot.postPaymentInfo(payments);

  await bot.postReceipt();

  await utils.clearThread();

  await utils.timeout(1000);

  const trackerUrl = readlineSync.question('Enter track url:\n');  // Pause until everyone is done ordering
  await bot.postTrackerUrl(trackerUrl);

  console.log(chalk.cyan.inverse("Finished. Thanks for choosing wingy!"));
}

main();
