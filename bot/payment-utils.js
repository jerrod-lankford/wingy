const utils = require('./utils.js');

const SMALL_FRY = 2.99;
const LARGE_FRY = 3.99;
const TIP_PERCENT = 0.15; // Hardcoded 15% tip, also hardcoded in order utils
const DELIVERY = 1;

module.exports.generatePayment = function(everyone, totalTax) {
  const subTotal = calcSubTotal(everyone);

  return everyone.map(person => {
    const { name, price, user_id } = person;
    const fries = calcFries(everyone, person).pp;
    const tax = calcIndividualTax(subTotal, price, fries, totalTax);
    const tipDelivery = calcTD(everyone);
    const total = price + fries + tax + tipDelivery;

    return {
      name,
      user_id,
      price,
      fries,
      tax,
      tipDelivery,
      total
    };
  });
};

// Returns both the total and per person values
function calcFries(everyone, person) {
  const fryPeeps = everyone.reduce((accum, curr) => {
    return curr.fries === 'Yes' ? ++accum : accum;
  }, 0);
  const fries = utils.fryCalc(fryPeeps);
  const total = fries.small * SMALL_FRY + fries.large * LARGE_FRY;
  let pp = 0;

  if (person && person.fries === 'Yes') {
    pp = total / fryPeeps;
  }

  return { total, pp };
}

function calcTD(everyone) {
  const preTaxTotal = calcSubTotal(everyone);

  return (
    (preTaxTotal * TIP_PERCENT + DELIVERY) /
    everyone.length
  );
}

function calcSubTotal(everyone) {
  const fryCost = calcFries(everyone).total;
  const subTotal = everyone.reduce((accum, curr) => {
    accum += curr.price;
    return accum;
  }, fryCost);

  return subTotal;
}

function calcIndividualTax(subTotal, price, fries, tax) {
  const taxPercent = subTotal / (price + fries);
  return tax * taxPercent;
}