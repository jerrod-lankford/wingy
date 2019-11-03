
const secret = require('./secret.json');
const { WebClient } = require('@slack/web-api');
const { createReadStream } = require('fs');

const CHECK_INTERVAL_MS = 1 * 1000;
const ORDER_STATUS_SELECTOR = '#order-tracker-status-text';
const RECEIPT_SELECTOR = '#order-tracker-order-slip';
const ORDER_FORM = 'https://forms.gle/ouChfMnAXKvnz8MP9';
const ORDER_TRACKER_FRAGMENT = '/orderTracker?';
const CHANNEL_NAME = 'test-jerrod';

module.exports.ChatBot = class ChatBot {
    constructor() {
        this.web = new WebClient(secret.slack_token);
    }

    async postOrderForm() {
        const result = await postMessage(this.web, `Order up: ${ORDER_FORM}`);
        this.thread_ts = result.ts;
    }

    async startOrderMonitoring(page) {
        let lastKnownStatus;
        const interval = setInterval(async () => {
            let status = await page.evaluate((selector) => document.querySelector(selector).textContent, ORDER_STATUS_SELECTOR);
            status = status.trim();
            if (status !== lastKnownStatus) {
                postMessage(this.web, `Wing status: ${status}`, this.thread_ts);
                lastKnownStatus = status;
            }
    
            if (status.includes('Delivered')) {
                console.log('Order tracking concluded');
                clearInterval(interval);
            } else {
                await page.reload();
            }
        }, CHECK_INTERVAL_MS);    
    }

    async postReceipt(page) {
        await page.waitForSelector(RECEIPT_SELECTOR);
        await screenshotDOMElement(page, RECEIPT_SELECTOR);

        await this.web.files.upload({
            filename: "receipt",
            file: createReadStream('./receipt.png'),
            channels: CHANNEL_NAME,
            thread_ts: this.thread_ts
        });
    }

    async postPaymentInfo() {
        // TODO
    }

    waitForOrderPage(page, callback) {
        const interval = setInterval(() => {
            if (page.url().includes(ORDER_TRACKER_FRAGMENT)) {
                clearInterval(interval);
                callback();
            }
        }, 1000);
    }
};

async function postMessage(web, text, thread_ts) {
    return await web.chat.postMessage({
        channel: CHANNEL_NAME,
        text,
        thread_ts
    });
}

async function screenshotDOMElement(page, selector) {
    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, selector);
  
    return await page.screenshot({
      path: 'receipt.png',
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    });
}