
const puppeteer = require('puppeteer');
const secret = require('./secret.json');
const axios = require('axios');

const CHECK_INTERVAL_MS = 1 * 1000;
const ORDER_STATUS_SELECTOR = '#order-tracker-status-text';
const RECEIPT_SELECTOR = '#order-tracker-order-slip';

async function start() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto('https://wingsoverraleigh.foodtecsolutions.com/orderTracker?order=LU0ZUQ%255BgA5wML9I%255BhoSA0OqA5H4mZo0tMtV0Df0I4MTAkHUMzBQXZMBngukwHxw1Gs8wUGyAU1kn4I7aEnc46%255BwcwE3MoMfA');
    
    await screenshotDOMElement(page, RECEIPT_SELECTOR);
    
    let lastKnownStatus;
    const interval = setTimeout(async () => {
        let status = await page.evaluate((selector) => document.querySelector(selector).textContent, ORDER_STATUS_SELECTOR);
        status = status.trim();
        if (status !== lastKnownStatus) {
            postMessage(`Wing status: ${status}`);
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

function postMessage(text) {
    axios.post(secret.webhook_url, {text})
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    });
}

// Thanks stackoverflow!
async function screenshotDOMElement(page, selector, padding = 0) {
    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, selector);
  
    return await page.screenshot({
      path: 'element.png',
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      }
    });
}

start();