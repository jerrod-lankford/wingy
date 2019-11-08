
const secret = require('./secret.json');
const { WebClient } = require('@slack/web-api');
const { createReadStream } = require('fs');
const { slackBlocks } = require('../common/slack-blocks.js');
const chalk = require('chalk');

const CHECK_INTERVAL_MS = 15 * 1000;
const ORDER_STATUS_SELECTOR = '#order-tracker-status-text';
const RECEIPT_SELECTOR = '#order-tracker-order-slip';
const ESTIMATED_DELIVERY_SELECTOR = "//*[contains(text(),'Approximately')]";
const ORDER_TRACKER_FRAGMENT = '/orderTracker?';
const CHANNEL_NAME = 'test-jerrod';
const ORDER_TRACKER_CONTAINER_SELECTOR = '#order-tracker-container'
const ORDER_PREPERATION_SELECTOR = '#order-tracker-overlay';

module.exports.ChatBot = class ChatBot {
    constructor() {
        this.web = new WebClient(secret.slack_token);
    }

    setThreadTs(thread_ts) {
        this.thread_ts = thread_ts;
    }

    async postOrderForm() {
        const result = await postMessage(this.web, {text: 'Order up! Lunch thread...', blocks: slackBlocks});
        this.thread_ts = result.ts;
        console.log(chalk.bgMagenta(`Thread id for recovery: ${this.thread_ts}`));
    }

    async atMentionEveryone(everyone) {
        const { thread_ts } = this;
        const text = everyone.map(e => `@${e.name}`).join(' ');
        await postMessage(this.web, {text, thread_ts, link_names: true});
    }

    async startOrderMonitoring(page) {
        const { thread_ts } = this;
        console.log('Starting order monitoring...');
        let lastKnownStatus, lastKnownEstimatedDelivery;
        const interval = setInterval(async () => {
            const status = await getStatus(page);
            const estimatedDelivery = await getEstimatedDelivery(page);

            // Post estimated delivery
            if (lastKnownEstimatedDelivery !== estimatedDelivery) {
                await postMessage(this.web, {text: `Esimated delivery: ${estimatedDelivery}`, thread_ts});
                lastKnownEstimatedDelivery = estimatedDelivery;
            }

            // Post delivery status
            if (status !== lastKnownStatus) {
                await postMessage(this.web, {text: `Wing status: ${status}`, thread_ts});
                lastKnownStatus = status;
            }
    
            // Either return or reload
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

        // There seems to be a glitch that causes the receipt to be blank
        // so lets wait a sec before taking the screenshot after finding the dom node
        await timeout(1000);
        await screenshotDOMElement(page, RECEIPT_SELECTOR, 'receipt.png');

        await this.web.files.upload({
            filename: 'receipt',
            file: createReadStream('./receipt.png'),
            channels: CHANNEL_NAME,
            thread_ts: this.thread_ts
        });
    }

    async postPaymentInfo(page, payments) {
        payments.forEach(async p => {
            const response = await this.web.im.open({ user: p.user_id});
            const channel = response.channel.id;
            const text = `Hi ${p.name}, you owe *${format(p.total)}*.\n` + 
                `Cost Breakdown - Price: ${format(p.price)} + Fries: ${format(p.fries)} + Tax/Tip/Delivery: ${format(p.ttd)}\n` +
                `Accepted Payment methods: :paypal: paypal.me/JerrodLankford or :venmo: jerrod-lankford`;
            await postMessage(this.web, {text, channel});
        });
    }

    async postOrderPreperation(page) {
        const { thread_ts } = this;
        await page.waitForSelector(ORDER_TRACKER_CONTAINER_SELECTOR);
        const text = await page.evaluate((selector) => {
            const orderPrep = document.querySelector(selector);
            return orderPrep && orderPrep.textContent;
        }, ORDER_PREPERATION_SELECTOR);

        if (text) {
            await postMessage(this.web, {text, thread_ts});
        }
    }

    waitForOrderPage(page, callback) {
        console.log('Waiting for order status page...');
        const interval = setInterval(() => {
            if (page.url().includes(ORDER_TRACKER_FRAGMENT)) {
                clearInterval(interval);
                callback();
            }
        }, 1000);
    }
};

/****** HELPER NETHODS ********/
async function getStatus(page) {
    const status = await page.evaluate((selector) => document.querySelector(selector).textContent, ORDER_STATUS_SELECTOR);
    return status.trim();
}

async function getEstimatedDelivery(page) {
    const xpathData = await page.$x(ESTIMATED_DELIVERY_SELECTOR);
    if (xpathData && xpathData.length > 0) {
        const xpathTextContent = await xpathData[0].getProperty('textContent');
        return await xpathTextContent.jsonValue();
    }
    return '';
}

async function postMessage(web, additionalParams) {
    let params = {
        channel: CHANNEL_NAME
    };

    params = Object.assign(params, additionalParams);
    return await web.chat.postMessage(params);
}

async function screenshotDOMElement(page, selector, name) {
    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
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

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function format(value) {
    const newValue = value.toFixed(2);
    return `$${newValue}`;
}