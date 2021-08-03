const secret = require('./secret.json');
const { WebClient } = require('@slack/web-api');
const { createReadStream } = require('fs');
const { slackBlocks } = require('../common/slack-blocks.js');
const chalk = require('chalk');
const CONFIG = require('./configuration.json');
const { timeout } = require('./utils');

const RECEIPT_SELECTOR = '//div[contains(concat(" ",normalize-space(@class)," ")," purchase-confirmation ")]//img[@alt="confirmation Image"]/following-sibling::div';
const ESTIMATED_DELIVERY_SELECTOR = 'div.purchase-confirmation [data-value="title1_accentDark"]';

module.exports.ChatBot = class ChatBot {
  constructor() {
    this.web = new WebClient(secret.slack_token);
  }

  setThreadTs(thread_ts) {
    this.thread_ts = thread_ts;
  }

  async postOrderForm() {
    const result = await postMessage(this.web, {
      text: 'Order up! Lunch thread...',
      blocks: slackBlocks
    });
    this.thread_ts = result.ts;
    return result.ts;
  }

  async atMentionEveryone(everyone) {
    const { thread_ts } = this;
    const text = everyone.map(e => `@${e.name}`).join(' ');
    await postMessage(this.web, { text, thread_ts, link_names: true });
  }

  async postReceipt(page) {
    await page.waitForSelector(RECEIPT_SELECTOR);

    // There seems to be a glitch that causes the receipt to be blank
    // so lets wait a sec before taking the screenshot after finding the dom node
    await timeout(1000);
    await screenshotDOMElement(page, RECEIPT_SELECTOR, 'receipt.png');

    await this.web.files.upload({
      filename: 'receipt',
      file: createReadStream('./receipt.png'),
      channels: CONFIG.channelName,
      thread_ts: this.thread_ts
    });
  }

  async postPaymentInfo(payments) {
    await payments.forEach(async p => {
      const response = await this.web.conversations.open({ users: p.user_id });
      const channel = response.channel.id;
      const text = `Hi ${p.name}, you owe *${format(p.total)}*.\n ${CONFIG.paymentInfo.replace('{$total}', p.total.toFixed(2))}
        *Cost Breakdown*
         Price: ${format(p.price)}
         Fries: ${format(p.fries)}
         Tax: ${format(p.tax)}
         Tip: ${format(p.tip)}
         Delivery: ${format(p.delivery)}`;
      await postMessage(this.web, { text, channel });
    });
  }

  async postOrderPreperation(page) {
    const { thread_ts } = this;
    await page.waitForSelector(ESTIMATED_DELIVERY_SELECTOR);
    const text = await page.evaluate(selector => {
      const estimated = document.querySelector(selector);
      return estimated && estimated.textContent;
    }, ESTIMATED_DELIVERY_SELECTOR);

    if (text) {
      await postMessage(this.web, { text: `Estimated Delivery: ${text}`, thread_ts });
    }
  }

  async postTrackerUrl(url) {
    const { thread_ts } = this;
    await postMessage(this.web, {text: `:chicken: :wings: tracker: ${url}`, thread_ts });
  }
};

/****** HELPER NETHODS ********/
async function postMessage(web, additionalParams) {
  let params = {
    channel: CONFIG.channelName
  };

  params = Object.assign(params, additionalParams);
  return await web.chat.postMessage(params);
}

async function screenshotDOMElement(page, selector, name) {
  const rect = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  }, selector);

  return await page.screenshot({
    path: name,
    clip: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    }
  });
}

function format(value) {
  const newValue = value.toFixed(2);
  return `$${newValue}`;
}
