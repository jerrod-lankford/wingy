const paymentUtils = require('./payment-utils.js');
const orderUtils = require('./order-utils.js');
const { ChatBot } = require('./chat-bot.js');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const utils = require('./utils.js');

async function main() {
  // Slackbot client
  const bot = new ChatBot();

  // If we have to bail this allows us to pass in a thread id to resume ordering in the same slack thrad
  if (process.env.THREAD_TS) {
    bot.setThreadTs(process.env.THREAD_TS);
  } else {
    console.log(
      'Clearing orders. This may take a while to wake up heroku dyno...'
    );

    await utils.clearOrders();
    await bot.postOrderForm();
  }

  // Pause until everyone is done ordering
  readlineSync.question('Please press enter when all orders are in\n');

  let everyone = await utils.getOrders();

  // Log Orders
  console.log(chalk.bgRed('Orders'));
  console.table(everyone, ['name', 'size', 'type', 'price', 'sauces', 'dressing', 'fries', 'complete']);

  // Validate everyones order is complete
  if (everyone.some(o => !o.complete)) {
    throw new Error('There is an incomplete order.');
  }

  // Order
  const page = await orderUtils.order(everyone);

  await orderUtils.logIn(page);

  const tax = await orderUtils.getTax(page);

  const payments = paymentUtils.generatePayment(everyone, tax);

  // Print total for sanity checking
  console.log(chalk.bgRed('Payments'));
  console.table(payments);
  let total = 0;
  payments.forEach(p => (total += p.total));
  console.log(`Total tax: ${tax}`);
  console.log(chalk.bgRed(`total: ${total}`));

  // Pause until I've actually placed the order
  readlineSync.question('Please press enter when order is placed\n');  // Pause until everyone is done ordering

  await bot.atMentionEveryone(everyone);

  // await bot.postReceipt(page);

  // await bot.postOrderPreperation(page);

  await bot.postPaymentInfo(payments);

  console.log(chalk.bgCyan("Finished. Thanks for choosing wingy!"));
}

main();
