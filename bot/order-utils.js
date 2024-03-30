import { FRY_RUBS } from '../common/menu-items.js';

/**
 * Basically if we have less than three rubs just randomize one
 * Otherwise it doesn't really matter at that point
 * Will update preivousRubs array for you
 */
function getSauce(previousRubs) {
  let choices;
  if (previousRubs.length < 3) {
    choices = FRY_RUBS.filter((value) => (
      previousRubs.indexOf(value) === -1
    ));
  } else {
    choices = [].concat(FRY_RUBS);
  }

  const index = Math.floor(Math.random() * choices.length);
  const choice = choices[index];

  previousRubs.push(choice);
  return choice;
}

/**
 * Fry calculation, 2 people to a large, 1 gets a small
 * @param {number} numPeople Number of people
 * @returns Calculated number of large and small fries based on number of people
 */
export function fryCalc(numPeople) {
  const large = Math.floor(numPeople / 2);
  const small = numPeople % 2;

  return {
    large,
    small,
  };
}

/**
 * Take the above function and generate a list of fry orders
 * @param {object} everyone Array of people
 * @param {object} page Puppeteer page
 * @returns List of objects representing orders
 */
export function createFryOrders(everyone) {
  // Number of people that want frys
  const fryPeeps = everyone.reduce((accum, curr) => (
    curr.fries === 'Yes' ? accum + 1 : accum
  ), 0);

  const fries = fryCalc(fryPeeps);
  const orders = [];
  const rubs = [];

  // Build small fry orders
  for (let i = 0; i < fries.small; i++) {
    orders.push({
      item: 'Regular Fries',
      sauces: [getSauce(rubs)],
    });
  }

  // Build large fry orders
  for (let i = 0; i < fries.large; i++) {
    orders.push({
      item: 'Large Fries',
      sauces: [getSauce(rubs)],
    });
  }
  return orders;
}
