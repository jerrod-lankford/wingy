import { fryCalc } from './order-utils.js';
import { SIDES, TIP_PERCENT, DELIVERY } from '../common/menu-items.js';

const SMALL_FRY = SIDES.Fries['Regular Fries'];
const LARGE_FRY = SIDES.Fries['Large Fries'];

export function generatePayment(everyone, totalTax, isDelivery) {
  const subTotal = calcSubTotal(everyone);

  return everyone.map(person => {
    const { name, price, user_id } = person;
    const fries = calcFries(everyone, person).pp;
    const tax = calcTax(subTotal, price, fries, totalTax);
    let tip = 0, delivery = 0;

    if (isDelivery) {
      // Im not being cheap, theres literally no way to tip for pickup
      tip = calcTip(price, fries);
      delivery = calcDelivery(everyone.length);
    }
    const total = price + fries + tax + tip + delivery;

    return {
      name,
      user_id,
      price,
      fries,
      tax,
      tip,
      delivery,
      total
    };
  });
};

// Returns both the total and per person values
function calcFries(everyone, person) {
  const fryPeeps = everyone.reduce((accum, curr) => {
    return curr.fries === 'Yes' ? ++accum : accum;
  }, 0);
  const fries = fryCalc(fryPeeps);
  const total = fries.small * SMALL_FRY + fries.large * LARGE_FRY;
  let pp = 0;

  if (person && person.fries === 'Yes') {
    pp = total / fryPeeps;
  }

  return { total, pp };
}

function calcTip(price, fries) {
  return (price + fries) * TIP_PERCENT;
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
  const subTotal = everyone.reduce((accum, curr) => {
    accum += curr.price;
    return accum;
  }, fryCost);

  return subTotal;
}