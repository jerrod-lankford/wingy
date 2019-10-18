const FRY_COST = 3.99; // TODO hardcoded for now
const TAX_RATE = 0.082357385719683; // TODO CHECK
const TIP_PERCENT = .15;
const DELIVERY = 1;

module.exports.parseRow = function(row) {
    // TODO row validation
    const name = row[1],
        type = row[2],
        priceAndSize = row[3] || row[6],
        dressing = row[4] || row[7],
        fries = row[5] || row[8],
        sauces = row[9] || row[10];

    let order, price;

    if (priceAndSize) {
        const split = priceAndSize.split('$');
        order = split[0].substr(0,split[0].length-3),
        price = parseFloat(split[1].trim());
    }

    return {
        name,
        type,
        order,
        price,
        dressing,
        fries,
        sauces
    }
};

module.exports.generatePayment = function(everyone) {
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