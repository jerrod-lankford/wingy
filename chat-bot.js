
const secret = require('./secret.json');
const { WebClient } = require('@slack/web-api');
const { createReadStream } = require('fs');
const chalk = require('chalk');

const CHECK_INTERVAL_MS = 15 * 1000;
const ORDER_STATUS_SELECTOR = '#order-tracker-status-text';
const RECEIPT_SELECTOR = '#order-tracker-order-slip';
const ESTIMATED_DELIVERY_SELECTOR = "//*[contains(text(),'Approximately')]";
const ORDER_FORM = 'https://forms.gle/ouChfMnAXKvnz8MP9';
const ORDER_TRACKER_FRAGMENT = '/orderTracker?';
const TOTAL_SELECTOR = '#total';
const PAYMENTS_SELECTOR = '#payments';
const CHANNEL_NAME = 'test-jerrod';

module.exports.ChatBot = class ChatBot {
    constructor() {
        this.web = new WebClient(secret.slack_token);
    }

    setThreadTs(thread_ts) {
        this.thread_ts = thread_ts;
    }

    async postOrderForm() {
        const result = await postMessage(this.web, `Order up: ${ORDER_FORM}`);
        this.thread_ts = result.ts;
        console.log(chalk.bgMagenta(`Thread id for recovery: ${this.thread_ts}`));
    }

    async startOrderMonitoring(page) {
        let lastKnownStatus, lastKnownEstimatedDelivery;
        const interval = setInterval(async () => {
            const status = await getStatus(page);
            const estimatedDelivery = await getEstimatedDelivery(page);

            // Post estimated delivery
            if (lastKnownEstimatedDelivery !== estimatedDelivery) {
                await postMessage(this.web, `Esimated delivery: ${estimatedDelivery}`, this.thread_ts);
                lastKnownEstimatedDelivery = estimatedDelivery;
            }

            // Post delivery status
            if (status !== lastKnownStatus) {
                await postMessage(this.web, `Wing status: ${status}`, this.thread_ts);
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
        await screenshotDOMElement(page, RECEIPT_SELECTOR, 'receipt.png');

        await this.web.files.upload({
            filename: 'receipt',
            file: createReadStream('./receipt.png'),
            channels: CHANNEL_NAME,
            thread_ts: this.thread_ts
        });
    }

    async postPaymentInfo(page, payments) {
        await page.goto(`file://${__dirname}/payment.html`);

        // Build html table
        let rows = '';
        let allTotal = 0;
        payments.forEach(p => {
            rows+= `
                <tr>
                    <td>${p.name}</td>
                    <td>${format(p.price)}</td>
                    <td>${format(p.fries)}</td>
                    <td>${format(p.ttd)}</td>
                    <td>${format(p.total)}</td>
                </tr>
            `;
            allTotal += p.total;
        });

        allTotal = format(allTotal);

        // Inject rows into dom
        await page.evaluate((rows, TOTAL_SELECTOR, allTotal) => {
            const dom = document.querySelector('tbody');
            const total = document.querySelector(TOTAL_SELECTOR);
            dom.innerHTML = rows;
            total.innerHTML = allTotal;
         }, rows, TOTAL_SELECTOR, allTotal);

         // Screnshot and upload to slack
         await screenshotDOMElement(page, PAYMENTS_SELECTOR, 'payments.png');
         await page.goBack();
         await this.web.files.upload({
            filename: 'payments',
            file: createReadStream('./payments.png'),
            channels: CHANNEL_NAME,
            thread_ts: this.thread_ts
        });
    }

    async postAcceptedPayments() {
       await postMessage(this.web, 'Payment methods: Paypal - jllankfo@ncsu.edu or Venmo - jerrod-lankford', this.thread_ts);
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

async function postMessage(web, text, thread_ts) {
    return await web.chat.postMessage({
        channel: CHANNEL_NAME,
        text,
        thread_ts
    });
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

function format(value) {
    const newValue = value.toFixed(2);
    return `$${newValue}`;
}