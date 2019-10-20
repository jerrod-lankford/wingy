const chalk = require('chalk');
const utils = require('./utils.js');

const SMALL_FRY = 2.99;
const LARGE_FRY = 3.99;
const TAX_RATE = 0.082357385719683; // TODO CHECK
const TIP_PERCENT = .15; // Hardcoded 15% tip, also hardcoded in order utils
const DELIVERY = 1;

module.exports.printPayment = function(everyone) {
    const payments = generatePayment(everyone);
    console.log(chalk.bgRed('Payments'));
    console.table(payments);
    
    let total = 0;
    payments.forEach(p => total+= p.total);
    console.log(chalk.bgRed(`total: ${total}`));
    
    console.log('Paypal: jllankfo@ncsu.edu - Venmo: jerrod-lankford');
}


function generatePayment(everyone) {
    return everyone.map(person => {
        const { name, price } = person;
        const fries = calcFries(everyone, person).pp;
        const ttd = calcTTD(everyone);
        const total = price + fries + ttd;

        return {
            name,
            price,
            fries,
            ttd,
            total: +total.toFixed(2)
        }
    });
};

// Returns both the total and per person values
function calcFries(everyone, person) {
    const fryPeeps = everyone.reduce((accum, curr) => {
        return curr.fries === 'Yes' ? ++accum : accum;
    }, 0);
    const fries = utils.fryCalc(fryPeeps);
    const total =  ((fries.small * SMALL_FRY) + (fries.large * LARGE_FRY));
    let pp = 0;

    if (person && person.fries === 'Yes') {
        pp = total / fryPeeps;
    }

    return {total, pp};
}

function calcTTD(everyone) {
    const fryCost = calcFries(everyone).total;
    const preTaxTotal = everyone.reduce((accum, curr) => {
        accum += curr.price;
        return accum;
    }, fryCost);
    const ttd = ((preTaxTotal * TAX_RATE) + (preTaxTotal * TIP_PERCENT) + DELIVERY) / everyone.length;
    return +ttd.toFixed(2);
}