/* eslint-disable no-underscore-dangle */
import { WebClient } from '@slack/web-api';
import path from 'path';
import { fileURLToPath } from 'url';
import secret from './secret.json' with { type: 'json' };
import { slackBlocks, orderBlocks } from '../common/slack-blocks.js';
import CONFIG from './configuration.json' with { type: 'json' };
import { ESTIMATED_DELIVERY_SELECTOR } from './wo-selectors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** HELPER METHODS */
async function postMessage(web, additionalParams) {
  let params = {
    channel: CONFIG.channelName,
  };
  params = Object.assign(params, additionalParams);
  return web.chat.postMessage(params);
}

function format(value) {
  const newValue = value.toFixed(2);
  return `$${newValue}`;
}

/**
 * Class responsible for interacting with the Slack API
 */
export default class ChatBot {
  constructor() {
    this.web = new WebClient(secret.slack_token);
  }

  resumeThread(slackId, channel, teamId) {
    this.slackId = slackId;
    this.channel = channel;
    this.teamId = teamId;
  }

  async postOrderForm() {
    const result = await postMessage(this.web, {
      text: 'Order up! Lunch thread...',
      blocks: slackBlocks,
    });
    this.slackId = result.ts;
    this.channel = result.channel;
    this.teamId = result.message.team;
    return { slackId: this.slackId, channel: this.channel, teamId: this.teamId };
  }

  async atMentionEveryone(everyone) {
    const { slackId } = this;
    const text = everyone.map((e) => `@${e.name}`).join(' ');
    await postMessage(this.web, { text, thread_ts: slackId, link_names: true });
  }

  async postReceipt() {
    const { slackId, channel } = this;

    await this.web.files.uploadV2({
      file: path.join(__dirname, '../receipt.png'),
      filename: 'receipt.png',
      thread_ts: slackId,
      channel_id: channel,
    });
  }

  async postOrderInfo(orders) {
    for (const o of orders) {
      const response = await this.web.conversations.open({ users: o.userId });
      const channel = response.channel.id;
      await postMessage(this.web, { text: 'Order Summary', blocks: orderBlocks(o, this.slackId), channel });
    }
  }

  async postPaymentInfo(payments) {
    for (const p of payments) {
      const response = await this.web.conversations.open({ users: p.userId });
      const channel = response.channel.id;
      const text = `You owe *${format(p.total)}*.\n ${CONFIG.paymentInfo.replaceAll('{$total}', p.total.toFixed(2))}\n`
        + '*Cost Breakdown*\n'
        + `Price: ${format(p.price)}\n`
        + `Fries: ${format(p.fries)}\n`
        + `Tax: ${format(p.tax)}\n`
        + `Tip: ${format(p.tip)}\n`
        + `Delivery: ${format(p.delivery)}`;
      await postMessage(this.web, { text, channel });
    }
  }

  async postOrderPreparation(page) {
    const { slackId } = this;
    await page.waitForSelector(ESTIMATED_DELIVERY_SELECTOR);
    const text = await page.evaluate((selector) => {
      const estimated = document.querySelector(selector);
      return estimated && estimated.textContent.replace('Date:', 'Date: ');
    }, ESTIMATED_DELIVERY_SELECTOR);

    if (text) {
      await postMessage(this.web, { text, thread_ts: slackId });
    }
  }

  async postTrackerUrl(url) {
    const { slackId } = this;
    await postMessage(this.web, { text: `:chicken: :wings: tracker: ${url}`, thread_ts: slackId });
  }
}
