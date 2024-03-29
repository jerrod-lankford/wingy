import { FRY_RUBS } from '../common/menu-items.js';

/**
 * Fry calculation, 2 people to a large, 1 gets a small
 * @param {number} numPeople 
 * @returns 
 */
export function fryCalc(numPeople) {
  const large = Math.floor(numPeople / 2);
  const small = numPeople % 2;

  return {
    large,
    small
  };
};

/**
 * Take the above function and generate a list of fry orders
 * @param {object} everyone Array of people
 * @param {object} page Puppeteer page
 * @returns 
 */
export function createFryOrders(everyone, page) {
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
  
    previousRubs.push(choice);
    return choice;
  }