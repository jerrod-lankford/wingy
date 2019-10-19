const chalk = require('chalk');

const FRY_COST = 3.99; // TODO hardcoded for now
const TAX_RATE = 0.082357385719683; // TODO CHECK
const TIP_PERCENT = .15;
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
        const fries = calcFries(everyone, person);
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

function calcFries(everyone, person) {
    if (person.fries === 'Yes') {
        const fryPeeps = everyone.reduce((accum, curr) => {
            if (curr.fries === 'Yes') {
                accum++;
            }
            return accum;
        }, 0);
        return +(FRY_COST / fryPeeps).toFixed(2);
    }

    return 0;
}

function calcTTD(everyone) {
    const preTaxTotal = everyone.reduce((accum, curr) => {
        accum += curr.price;
        return accum;
    }, FRY_COST);
    const ttd = ((preTaxTotal * TAX_RATE) + (preTaxTotal * TIP_PERCENT) + DELIVERY) / everyone.length;
    return +ttd.toFixed(2);
}