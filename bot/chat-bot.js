import { WebClient } from '@slack/web-api';
import secret from './secret.json' with { type: 'json' };
import { slackBlocks } from '../common/slack-blocks.js';
import CONFIG from './configuration.json' with { type: 'json' };
import { uploadImage } from './utils.js';
import { ESTIMATED_DELIVERY_SELECTOR } from './wo-selectors.js';

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

  setThreadTs(threadTs) {
    this.threadTs = threadTs;
  }

  async postOrderForm() {
    const result = await postMessage(this.web, {
      text: 'Order up! Lunch thread...',
      blocks: slackBlocks,
    });
    this.threadTs = result.ts;
    return result.ts;
  }

  async atMentionEveryone(everyone) {
    const { threadTs } = this;
    const text = everyone.map((e) => `@${e.name}`).join(' ');
    await postMessage(this.web, { text, thread_ts: threadTs, link_names: true });
  }

  async postReceipt() {
    const { threadTs } = this;
    const receiptUrl = await uploadImage(threadTs);
    await postMessage(this.web, { text: receiptUrl, thread_ts: threadTs });
  }

  async postPaymentInfo(payments) {
    await payments.forEach(async (p) => {
      const response = await this.web.conversations.open({ users: p.userId });
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

  async postOrderPreparation(page) {
    const { threadTs } = this;
    await page.waitForSelector(ESTIMATED_DELIVERY_SELECTOR);
    const text = await page.evaluate((selector) => {
      const estimated = document.querySelector(selector);
      return estimated && estimated.textContent;
    }, ESTIMATED_DELIVERY_SELECTOR);

    if (text) {
      await postMessage(this.web, { text: `Estimated Delivery: ${text}`, thread_ts: threadTs });
    }
  }

  async postTrackerUrl(url) {
    const { threadTs } = this;
    await postMessage(this.web, { text: `:chicken: :wings: tracker: ${url}`, thread_ts: threadTs });
  }
}
