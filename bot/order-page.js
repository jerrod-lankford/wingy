import puppeteer from 'puppeteer';
import { timeout } from './utils.js';
import secret from './secret.json' with { type: 'json' };
import configuration from './configuration.json' with { type: 'json' };
import * as S from './wo-selectors.js';
import { createFryOrders } from './order-utils.js';
import { TIP_PERCENT_DELIVERY, TIP_PERCENT_PICKUP } from '../common/menu-items.js';

const ADDRESS = configuration.address;
const TIP_DELIVERY = TIP_PERCENT_DELIVERY * 100;
const TIP_PICKUP = TIP_PERCENT_PICKUP * 100;

const HEIGHT = 800;
const WIDTH = 1600;
const SHORT_WAIT = 2000;
const SHORTER_WAIT = 1000;

const MENU = 'https://order.wingsover.com/';

async function waitThenClick(page, selector) {
  const element = await page.waitForSelector(selector, { visible: true });
  await element.click();
}

async function waitThenType(page, selector, text) {
  await page.waitForSelector(selector);
  await page.type(selector, text);
}
/* Helper functions */
// At the time of writing there is an ad when landing on the page for the first time, can probably remove this eventually
// Can we inject a cookie instead?
async function waitAndClosePopup(page) {
  try {
    const iframePopup = await page.waitForSelector(S.IFRAME_POPUP, { timeout: 5000, visible: true });
    const frame = await iframePopup.contentFrame();
    await frame.waitForSelector(S.DIALOG_CONTAINER);
    await frame.click(S.CLOSE_DIALOG_CONTAINER);
    await timeout(SHORTER_WAIT); // Wait for animation
  } catch (e) {
    console.error(e);
  }
}

async function goToOrderPage(page, delivery) {
  // Pickup is selected by default
  if (delivery) {
    await waitThenClick(page, S.DELIVERY_SELECTOR);
  }
  // Stupid website wont show the autocomplete if you type it all at once, so type most of it, then type the last bit with a delay]
  await page.waitForSelector(S.ADDRESS_INPUT_SELECTOR);
  await page.type(S.ADDRESS_INPUT_SELECTOR, ADDRESS.substring(0, ADDRESS.length - 5));
  await page.type(S.ADDRESS_INPUT_SELECTOR, ADDRESS.substring(ADDRESS.length - 5), { delay: 300 });
  await waitThenClick(page, S.ADDRESS_SELECT_SELECTOR.replace('{0}', ADDRESS));
  await waitThenClick(page, S.ADDRESS_ORDER_SELECTOR);
}

async function start(delivery) {
  const browser = await puppeteer.launch({ headless: false, args: [`--window-size=${WIDTH},${HEIGHT + 100}`] });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  await page.goto(MENU);
  await waitAndClosePopup(page);
  await goToOrderPage(page, delivery);
  return page;
}

/* Order class to create an order for a person */
class Order {
  constructor(person, page) {
    this.person = person;
    this.page = page;
  }

  async type() {
    await waitThenClick(this.page, S.TYPE_SELECTORS[this.person.type]);
    await timeout(SHORTER_WAIT);
  }

  async item() {
    const selector = S.ORDER_SELECTORS[this.person.item];
    await waitThenClick(this.page, selector);
    await timeout(SHORTER_WAIT);
  }

  async sauces() {
    for (const sauce of this.person.sauces) {
      const selector = S.ITEM_SELECTOR.replace('{0}', sauce.replace("'", "\\'"));
      await waitThenClick(this.page, selector);
    }
  }

  async dressing() {
    const dressing = this.person.dressing || S.NO_DRESSING;
    const selector = S.ITEM_SELECTOR.replace('{0}', dressing);
    await waitThenClick(this.page, selector);
  }

  async done() {
    await waitThenClick(this.page, S.ADD_TO_CART_SELECTOR);
    await timeout(SHORTER_WAIT);
  }
}

export async function order(everyone, delivery) {
  const page = await start(delivery);

  for (const person of everyone) {
    const pOrder = new Order(person, page);
    await pOrder.type();
    await pOrder.item();
    await pOrder.sauces();
    await pOrder.dressing();
    await pOrder.done();
  }

  const fryOrders = createFryOrders(everyone, page).map((fryOrder) => (new Order({
    type: 'Fries',
    ...fryOrder,
  }, page)));

  for (const fryOrder of fryOrders) {
    await fryOrder.type();
    await fryOrder.item();
    await fryOrder.sauces();
    await fryOrder.done();
  }

  return page;
}

export async function logIn(page) {
  await waitThenClick(page, S.CART_SELECTOR);
  await waitThenClick(page, S.CHECKOUT_SELECTOR);
  await waitThenType(page, S.EMAIL_SELECTOR, configuration.email);
  await waitThenClick(page, S.CART_LOGIN);
  await waitThenType(page, S.PASSWORD_SELECTOR, secret.password);
  await waitThenClick(page, S.CART_LOGIN_2);
}

export async function getTax(page) {
  await waitThenClick(page, S.PROCEED_TO_PAYMENT_SELECTOR);
  await page.waitForSelector(S.TAX_SELECTOR, { visible: true });
  const element = await page.waitForSelector(S.TAX_SELECTOR);
  const text = await page.evaluate((el) => el.textContent, element);
  return parseFloat(text.replace('$', ''));
}

export async function tip(page, delivery) {
  await timeout(SHORT_WAIT); // wait for expand animation
  const selector = S.TIP_SELECTOR.replace('{0}', delivery ? TIP_DELIVERY : TIP_PICKUP);
  await waitThenClick(page, selector);
}

export async function grabReceipt(page) {
  try {
    const receipt = await page.waitForSelector(S.RECEIPT_SELECTOR);
    await receipt.screenshot({ path: 'receipt.png' });
  } catch (e) {
    console.log('Error saving receipt');
    console.error(e);
  }
}
