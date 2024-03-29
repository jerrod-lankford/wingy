import { TIP_PERCENT } from '../common/menu-items.js';

const TIP = TIP_PERCENT * 100;

// Prefer text based selectors where possible, those are less likely to break
export const ADDRESS = configuration.address;
export const IFRAME_POPUP = "#attentive_overlay iframe"
export const DIALOG_CONTAINER = '#page1';
export const CLOSE_DIALOG_CONTAINER = '#closeIconContainer'
export const ADDRESS_INPUT_SELECTOR = 'input.input-delivery, input.input-pickup';
export const ADDRESS_SELECT_SELECTOR = `::-p-xpath(//span[text()="${ADDRESS}, USA"])`;
export const ADDRESS_ORDER_SELECTOR = '::-p-xpath(//*[contains(@class,"location-card")]//span[text()="Order"])';
export const NO_DRESSING = 'No Dressing';
export const TYPE_SELECTOR = '::-p-xpath(//*[@id="itemDetailsContainer"]//div[text()="{0}"])';
export const ITEM_SELECTOR = 'img[alt="{0}"]';
export const TIP_SELECTOR = `::-p-xpath(//div[@data-component="CustomTipping"]//legend[contains(text(), "${TIP}")]/following-sibling::*)`;
export const RECEIPT_SELECTOR = `::-p-xpath(//ul[contains(@class, "checkout-tabs")]/li/div/div[2])`;
export const ADD_TO_CART_SELECTOR = '::-p-xpath(//div[@id="itemDetails"]//span[contains(text(),"Add To Cart")])';
export const PROCEED_TO_PAYMENT_SELECTOR = '::-p-xpath(//span[text()="Proceed to Payment"])';
export const DELIVERY_SELECTOR = '::-p-xpath(//*[contains(text(),"Delivery")])';
export const CART_SELECTOR = '::-p-xpath(//span[text()="CART"])';
export const YOUR_CART_SELECTOR = '::-p-xpath(//span[text()="Your Cart"])';
export const CHECKOUT_SELECTOR = '::-p-xpath(//span[text()="Login to Checkout"])';
export const EMAIL_SELECTOR = 'input[name="email"]';
export const PASSWORD_SELECTOR = 'input[name="password"]';
export const CART_LOGIN = 'button.cart-login-step-1';
export const CART_LOGIN_2 = 'button.cart-login-step-2';
export const TAX_SELECTOR = '::-p-xpath(//span[text()="Tax"]//ancestor::div/span[2])';
// TODO this needs to be updated the first time we purchase
export const ESTIMATED_DELIVERY_SELECTOR = 'div.purchase-confirmation [data-value="title1_accentDark"]';

export const ORDER_SELECTORS = {
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
  