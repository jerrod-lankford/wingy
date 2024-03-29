import puppeteer from 'puppeteer';
import { timeout, fryCalc } from './utils.js';
import secret from './secret.json' assert { type: "json" };
import configuration from './configuration.json' assert { type: "json" };

const MENU = 'https://order.wingsover.com/';

const ADDRESS = configuration.address;

const IFRAME_POPUP = "#attentive_overlay iframe"

const DIALOG_CONTAINER = '#page1';

const CLOSE_DIALOG_CONTAINER = '#closeIconContainer'

const ADDRESS_INPUT_SELECTOR = 'input.input-delivery, input.input-pickup';

const ADDRESS_SELECT_SELECTOR = `::-p-xpath(//span[text()="${ADDRESS}, USA"])`;

const ADDRESS_ORDER_SELECTOR = '::-p-xpath(//*[contains(@class,"location-card")]//span[text()="Order"])';

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

const TYPE_SELECTOR = '::-p-xpath(//*[@id="itemDetailsContainer"]//div[text()="{0}"])';

const ITEM_SELECTOR = 'img[alt="{0}"]';

// Hardcoded 15% tip, also hardcoded in payment utils
const TIP_SELECTOR = '::-p-xpath(//div[@data-component="CustomTipping"]//legend[contains(text(), "15")]/following-sibling::*)';

const RECEIPT_SELECTOR = `::-p-xpath(//ul[contains(@class, "checkout-tabs")]/li/div/div[2])`;

const ADD_TO_CART_SELECTOR = '::-p-xpath(//div[@id="itemDetails"]//span[contains(text(),"Add To Cart")])';

const PROCEED_TO_PAYMENT_SELECTOR = '::-p-xpath(//span[text()="Proceed to Payment"])';

const DELIVERY_SELECTOR = '::-p-xpath(//*[contains(text(),"Delivery")])';

const CART_SELECTOR = '::-p-xpath(//span[text()="CART"])';

const YOUR_CART_SELECTOR = '::-p-xpath(//span[text()="Your Cart"])';

const CHECKOUT_SELECTOR = '::-p-xpath(//span[text()="Login to Checkout"])';

const EMAIL_SELECTOR = 'input[name="email"]';

const PASSWORD_SELECTOR = 'input[name="password"]';

const CART_LOGIN = 'button.cart-login-step-1';

const CART_LOGIN_2 = 'button.cart-login-step-2';

const TAX_SELECTOR = '::-p-xpath(//span[text()="Tax"]//ancestor::div/span[2])';

const HEIGHT = 800;

const WIDTH = 1600;

export async function order(everyone, delivery) {
  const page = await start(delivery);

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

export async function logIn(page) {
  await waitThenClick(page, CART_SELECTOR);
  await waitThenClick(page, CHECKOUT_SELECTOR);
  await waitThenType(page, EMAIL_SELECTOR, configuration.email);
  await waitThenClick(page, CART_LOGIN);
  await waitThenType(page, PASSWORD_SELECTOR, secret.password);
  await waitThenClick(page, CART_LOGIN_2);
};

export async function getTax(page) {
  await waitThenClick(page, PROCEED_TO_PAYMENT_SELECTOR);
  await page.waitForSelector(TAX_SELECTOR, { visible: true });
  const element = await page.waitForSelector(TAX_SELECTOR);
  const text = await page.evaluate(el => el.textContent, element);
  return parseFloat(text.replace('$', ''));
}

export async function tip(page) {
    await timeout(2000); // wait for expand animation
    await waitThenClick(page, TIP_SELECTOR);
}

export async function grabReceipt(page, thread) {
  await waitThenClick(page, YOUR_CART_SELECTOR);
  await waitThenClick(page, CART_SELECTOR);
  await timeout(2000); // wait for expand animation
  const receipt = await page.waitForSelector(RECEIPT_SELECTOR);
  await receipt.screenshot({path: '../receipt.png'});
}

/* Helper functions */
// At the time of writing there is an ad when landing on the page for the first time
const waitAndClosePopup = async function(page) {
  try {
    const  iframePopup = await page.waitForSelector(IFRAME_POPUP);
    const frame = await iframePopup.contentFrame();
    await frame.waitForSelector(DIALOG_CONTAINER);
    await frame.click(CLOSE_DIALOG_CONTAINER);
    await timeout(1000); // Wait for animation
  } catch (e) {
    console.error(e);
  }
}

async function start(delivery) {
  const browser = await puppeteer.launch({ headless: false, args: [`--window-size=${WIDTH},${HEIGHT+100}`]});
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  await page.goto(MENU);
  await waitAndClosePopup(page);
  await goToOrderPage(page, delivery);
  return page;
}

async function goToOrderPage(page, delivery) {
  // Pickup is selected by default
  if (delivery) {
    await waitThenClick(page, DELIVERY_SELECTOR);
  }
  // Stupid website wont show the autocomplete if you type it all at once, so type most of it, then type the last bit with a delay]
  await page.waitForSelector(ADDRESS_INPUT_SELECTOR);
  await page.type(ADDRESS_INPUT_SELECTOR, ADDRESS.substr(0, ADDRESS.length-5));
  await page.type(ADDRESS_INPUT_SELECTOR, ADDRESS.substr(ADDRESS.length - 5), { delay: 300 });
  await waitThenClick(page, ADDRESS_SELECT_SELECTOR);
  await waitThenClick(page, ADDRESS_ORDER_SELECTOR);
}

async function waitThenClick(page, selector) {
    const element = await page.waitForSelector(selector, { visible: true });
    await element.click();
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
          item: 'Regular Fries',
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
          item: 'Large Fries',
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
    const selector = ORDER_SELECTORS[this.person.item];
    await waitThenClick(this.page, selector);
    await timeout(1000);
  }

  async type() {
    const selector = TYPE_SELECTOR.replace('{0}', this.person.item);
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
