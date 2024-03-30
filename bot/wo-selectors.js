// Prefer text based selectors where possible, those are less likely to break
export const IFRAME_POPUP = "#attentive_overlay iframe"
export const DIALOG_CONTAINER = '#page1';
export const CLOSE_DIALOG_CONTAINER = '#closeIconContainer'
export const ADDRESS_INPUT_SELECTOR = 'input.input-delivery, input.input-pickup';
export const ADDRESS_SELECT_SELECTOR = `::-p-xpath(//span[text()="{0}, USA"])`;
export const ADDRESS_ORDER_SELECTOR = '::-p-xpath(//*[contains(@class,"location-card")]//span[text()="Order"])';
export const NO_DRESSING = 'No Dressing';
export const ITEM_SELECTOR = 'img[alt="{0}"]';
export const TIP_SELECTOR = `::-p-xpath(//div[@data-component="CustomTipping"]//legend[contains(text(), "{0}")]/following-sibling::*)`;
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

export const TYPE_SELECTORS = {
  'Tenders': '.menu-item-1-1 button',
  'Wings': '.menu-item-2-1 button',
  'Fries': '.menu-item-6-2 button'
}

export const ORDER_SELECTORS = {
    '2 Tenders': '::-p-xpath(//div[text()="2 Tenders"])',
    '4 Tenders': '::-p-xpath(//div[text()="4 Tenders"])',
    '6 Tenders': '::-p-xpath(//div[text()="6 Tenders"])',
    '8 Tenders': '::-p-xpath(//div[text()="8 Tenders"])',
    '6 Wings': '::p-xpath(//div[text()="6 Wings"])',
    '9 Wings': '::-p-xpath(//div[text()="9 Wings"])',
    '12 Wings': '::-p-xpath(//div[text()="12 Wings"])',
    'Regular Fries': '::p-xpath(//div[text()="Regular"])',
    'Large Fries': '::p-xpath(//div[text()="Large"])',
  };
  