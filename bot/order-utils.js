const puppeteer = require('puppeteer');
const { timeout, fryCalc } = require('./utils');
const secret = require('./secret.json');
const configuration = require('./configuration.json');

const MENU = 'https://order.wingsover.com/';

const ADDRESS = '223 South West Street, Raleigh, NC 27603';

const ADDRESS_INPUT_SELECTOR = 'input.input-delivery';

const ADDRESS_SELECT_SELECTOR = '[datatest="address-1"]';

const ADDRESS_ORDER_SELECTOR = '.location-card-order-button-1';

const NO_DRESSING = 'No Dressing';

const ORDER_SELECTORS = {
  '2 Tenders': '.menu-item-1-0 button',
  '4 Tenders': '.menu-item-1-1 button',
  '6 Tenders': '.menu-item-1-2 button',
  '8 Tenders': '.menu-item-1-3 button',
  '6 Wings': '.menu-item-2-0 button',
  '9 Wings': '.menu-item-2-1 button',
  '12 Wings': '.menu-item-2-2 button',
  'Regular Fries': '.menu-item-5-0 button',
  'Large Fries': '.menu-item-5-0 button'
};

const FRY_RUBS = ['Cajun', 'West Texas Mesquite', 'Lemon Pepper ⭐️', '7 Pepper', 'Garlic Parm ⭐️'];

const ITEM_SELECTOR = 'img[alt="{0}"]';

const ADD_TO_CART_SELECTOR = '[datatest="itemDetails-add-to-cart-button"]';

const DELIVERY_SELECTOR = '//*[contains(text(),"Delivery")]';

const CART_SELECTOR = '[datatest="cart-icon"]';

const CHECKOUT_SELECTOR = '[datatest="cart-footer-log-in"]';

const CONTINUE_CHECKOUT_SELECTOR = '[datatest="cart-footer-continue-checkout"]';

const EMAIL_SELECTOR = 'input[name="email"]';

const PASSWORD_SELECTOR = 'input[name="password"]';

const CART_LOGIN = 'button.cart-login-step-1';

const CART_LOGIN_2 = 'button.cart-login-step-2';

const TAX_SELECTOR = '//div[span//text() = "Tax"]/span[2]';

const HEIGHT = 800;

const WIDTH = 1600;

module.exports.order = async function(everyone) {
  const page = await start();

  for (const person of everyone) {
    const order = new Order(person, page);
    await order.size();
    await order.type();
    await order.sauces();
    await order.dressing();
    await order.done();
  }

  const fryOrders = createFryOrders(everyone, page);
  for (const fryOrder of fryOrders) {
    await fryOrder.size();
    await fryOrder.type();
    await fryOrder.sauces();
    await fryOrder.done();
  }

  return page;
};

module.exports.logIn = async function(page) {
  await waitThenClick(page, CART_SELECTOR);
  await waitThenClick(page, CHECKOUT_SELECTOR);
  await waitThenType(page, EMAIL_SELECTOR, configuration.email);
  await waitThenClick(page, CART_LOGIN);
  await waitThenType(page, PASSWORD_SELECTOR, secret.password);
  await waitThenClick(page, CART_LOGIN_2);
  await waitThenClick(page, CONTINUE_CHECKOUT_SELECTOR);
};

module.exports.getTax = async function(page) {
  await page.waitForXPath(TAX_SELECTOR);
  const elements = await page.$x(TAX_SELECTOR);
  const text = await page.evaluate(el => el.textContent, elements[0]);
  return parseFloat(text.replace('$', ''));
}

/* Helper functions */
async function start() {
  const browser = await puppeteer.launch({ headless: false, args: [`--window-size=${WIDTH},${HEIGHT+100}`]});
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  await page.goto(MENU);
  await goToOrderPage(page);
  return page;
}

async function goToOrderPage(page) {
  await waitThenClick(page, DELIVERY_SELECTOR, true);
  await page.type(ADDRESS_INPUT_SELECTOR, ADDRESS);
  await waitThenClick(page, ADDRESS_SELECT_SELECTOR);
  await waitThenClick(page, ADDRESS_ORDER_SELECTOR);
}

async function waitThenClick(page, selector, isXpath) {
  if (isXpath) {
    await page.waitForXPath(selector);
    const elements = await page.$x(selector);
    await elements[0].click();
  } else {
    await page.waitForSelector(selector);
    await page.click(selector);
  }
}

async function waitThenType(page, selector, text) {
  await page.waitForSelector(selector);
  await page.type(selector, text);
}

function createFryOrders(everyone, page) {
  // Number of people that want frys
  const fryPeeps = everyone.reduce((accum, curr) => {
    return curr.fries === 'Yes' ? ++accum : accum;
  }, 0);
  const fries = fryCalc(fryPeeps);
  const orders = [];
  const rubs = [];

  // Build small fry orders
  for (let i = 0; i < fries.small; i++) {
    orders.push(
      new Order(
        {
          type: 'Fries',
          size: 'Regular',
          sauces: [getSauce(rubs)]
        },
        page
      )
    );
  }

  // Build large fry orders
  for (let i = 0; i < fries.large; i++) {
    orders.push(
      new Order(
        {
          type: 'Fries',
          size: 'Large',
          sauces: [getSauce(rubs)]
        },
        page
      )
    );
  }
  return orders;
}

/**
 * Basically if we have less than three rubs just randomize one
 * Otherwise it doesn't really matter at that point
 * Will update preivousRubs array for you
 */
function getSauce(previousRubs) {
  let choices;
  if (previousRubs.length < 3) {
    choices = FRY_RUBS.filter(value => {
      return previousRubs.indexOf(value) === -1;
    });
  } else {
    choices = [].concat(FRY_RUBS);
  }

  const index = Math.floor(Math.random() * choices.length);
  let choice = choices[index];

  // Break up mesquite and cajun
  if (choice.includes('/')) {
    choice = choice.split('/')[Math.floor(Math.random() * 2)];
  }

  previousRubs.push(choice);
  return choice;
}
/* end helper functions */

/* Order class to create an order for a person */
class Order {
  constructor(person, page) {
    this.person = person;
    this.page = page;
  }

  async size() {
    const order = `${this.person.size} ${this.person.type}`;
    const selector = ORDER_SELECTORS[order];
    await waitThenClick(this.page, selector);
    await timeout(1000);
  }

  async type() {
    const type = this.person.type === 'Fries' ? this.person.size : `${this.person.size} ${this.person.type}`;
    const selector = ITEM_SELECTOR.replace('{0}', type)
    await waitThenClick(this.page, selector);
  }

  async sauces() {
    for (const sauce of this.person.sauces) {
      const selector = ITEM_SELECTOR.replace('{0}', sauce.replace("'", "\\'"));
      await waitThenClick(this.page, selector);
    }
  }

  async dressing() {
    const dressing = this.person.dressing || NO_DRESSING;
    const selector = ITEM_SELECTOR.replace('{0}', dressing);
    await waitThenClick(this.page, selector);
  }

  async done() {
    await waitThenClick(this.page, ADD_TO_CART_SELECTOR);
    await timeout(1000);
  }
}
