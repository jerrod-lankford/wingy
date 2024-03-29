import secret from './secret.json' assert { type: "json" };
import { WebClient } from '@slack/web-api';
import { slackBlocks } from '../common/slack-blocks.js';  
import CONFIG from './configuration.json' assert { type: "json" };
import { uploadImage } from './utils.js';
import { ESTIMATED_DELIVERY_SELECTOR } from './wo-selectors.js';

/**
 * Class responsible for interacting with the Slack API
 */
export class ChatBot {
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

  async postReceipt() {
    const { thread_ts } = this;
    const receiptUrl = await uploadImage(thread_ts);
    await postMessage(this.web, { text: receiptUrl, thread_ts });
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

  async postOrderPreparation(page) {
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

function format(value) {
  const newValue = value.toFixed(2);
  return `$${newValue}`;
}
