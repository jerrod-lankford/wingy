module.exports.parseRow = function(row) {
    // TODO row validation
    const name = row[1],
        type = row[2],
        priceAndSize = row[3] || row[6],
        dressing = row[4] || row[7],
        fries = row[5] || row[8],
        sauces = parseSauce(row);

    let order, price;

    if (priceAndSize) {
        const split = priceAndSize.split('$');
        order = parseOrder(priceAndSize),
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

// 2 people to a small, 3 to a large
module.exports.fryCalc = function(numPeople) {
    let large = Math.floor(numPeople/3);
    let r = numPeople % 3;
    let small = 0;

    if (r === 1) {
        large !== 0 ? large-- : large;
        small += numPeople === 1 ? 1 : 2;
    } else if (r===2) {
        small++;
    }

    return {
        large,
        small
    }
}

function parseSauce(row) {
    const sauces = row[9] ? row[9].split(', ') : row[10].split(', ');
    return sauces.map(sauce =>  sauce.replace('(Dry)', '').trim());
}

function parseOrder(priceAndSize) {
    // Strip the price off
    const split = priceAndSize.split('$');
    const order = split[0].substr(0,split[0].length-3);

    // Strip the poundage off, if it exists
    return order.split('(')[0].trim();
}