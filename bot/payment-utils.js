/* eslint-disable import/prefer-default-export */
import { fryCalc } from './order-utils.js';
import {
  SIDES, TIP_PERCENT_DELIVERY, TIP_PERCENT_PICKUP, DELIVERY,
} from '../common/menu-items.js';

const SMALL_FRY = SIDES.Fries['Regular Fries'];
const LARGE_FRY = SIDES.Fries['Large Fries'];

// Returns both the total and per person values
function calcFries(everyone, person) {
  const fryPeeps = everyone.reduce((accum, curr) => (
    curr.fries === 'Yes' ? accum + 1 : accum
  ), 0);
  const fries = fryCalc(fryPeeps);
  const total = fries.small * SMALL_FRY + fries.large * LARGE_FRY;
  let pp = 0;

  if (person && person.fries === 'Yes') {
    pp = total / fryPeeps;
  }

  return { total, pp };
}

function calcTip(price, fries, isDelivery) {
  return (price + fries) * (isDelivery ? TIP_PERCENT_DELIVERY : TIP_PERCENT_PICKUP);
}

function calcDelivery(numPeople) {
  return DELIVERY / numPeople;
}

function calcTax(subtotal, price, fries, tax) {
  const taxPercent = (price + fries) / subtotal;
  return tax * taxPercent;
}

function calcSubTotal(everyone) {
  const fryCost = calcFries(everyone).total;
  const subTotal = everyone.reduce((accum, curr) => (
    accum + curr.price
  ), fryCost);

  return subTotal;
}

export function generatePayment(everyone, totalTax, isDelivery) {
  const subTotal = calcSubTotal(everyone);

  return everyone.map((person) => {
    const { name, price, userId } = person;
    const fries = calcFries(everyone, person).pp;
    const tax = calcTax(subTotal, price, fries, totalTax);
    let tip = 0;
    let delivery = 0;

    tip = calcTip(price, fries, isDelivery);
    if (isDelivery) {
      delivery = calcDelivery(everyone.length);
    }
    const total = price + fries + tax + tip + delivery;

    return {
      name,
      userId,
      price,
      fries,
      tax,
      tip,
      delivery,
      total,
    };
  });
}
