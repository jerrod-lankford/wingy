
const puppeteer = require('puppeteer');
const utils = require('./utils.js');

const MENU = 'https://wingsoverraleigh.foodtecsolutions.com/menu';

const NO_DRESSING = 'No Dressing';

const TYPE_SELECTORS = {
    'Boneless': 'div#Boneless\\+Wings',
    'Bone-in': 'div#Wings',
    'Side Orders': 'div#Side\\+Orders'
};

const SIZE_SELECTORS = {
    'DC-3': 'div#CSSDC-3Wings h5',
    'DC-10': 'div#CSSDC-10Wings h5',
    'Skymaster': 'div#CSSSkymasterWings h5',
    'Stratocruiser': 'div#CSSStratocruiserWings h5',
    'Paper Airplane': 'div#CSSPaper_AirplaneWings h5',
    'Puddle Jumper': 'div#CSSPuddle_JumperWings h5',
    'F-16': 'div#CSSF-16Wings h5',
    'B-1 Bomber': 'div#CSSB-1_BomberWings h5',
    'Small Waffle Fries': 'div#CSSWaffle_FriesAppetizer .menuPrice:nth-child(1) a',
    'Large Waffle Fries': 'div#CSSWaffle_FriesAppetizer .menuPrice:nth-child(2) a'
};

// We treat cajun and mesquite the same, will randomize between the two
const FRY_RUBS = ['Cajun/Mesquite', 'Garlic Parm', 'Ranch'];

const ITEM_SELECTOR = "span[title='{0}']";

const DONE_SELECTOR = 'button.item-edit-done';

const ADD_TIP_SELECTOR = '#add-tip-link';

const TIP_BUTTON_SELECTOR = '#calculator-button-15'; // Hardcoded 15% tip, also hardcoded in payment utils

const TIP_DONE_BUTTON_SELECTOR = '.tip-calculator-dialog .done-button';

module.exports.order = async function(everyone) {

    const page = await start();

    for (const person of everyone) {
        const order =  new Order(person, page);
        await order.type();
        await order.size();
        await order.sauces();
        await order.dressing();
        await order.done();
    }

    const fryOrders = createFryOrders(everyone, page);
    for (const fryOrder of fryOrders) {
        await fryOrder.type();
        await fryOrder.size();
        await fryOrder.sauces();
        await fryOrder.done();
    }

    await addTip(page);
}

/* Helper functions */
async function start() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto(MENU);
    return page;
}

async function waitThenClick(page, selector) {
    await page.waitForSelector(selector);
    await page.click(selector);
}

function createFryOrders(everyone, page) {
    // Number of people that want frys
    const fryPeeps = everyone.reduce((accum, curr) => {
        return curr.fries === 'Yes' ? ++accum : accum;
    }, 0);
    const fries = utils.fryCalc(fryPeeps);
    const orders = [];
    const rubs = [];

    // Build small fry orders
    for (let i=0; i < fries.small;i++) {
        orders.push(new Order({ type: 'Side Orders', order: 'Small Waffle Fries', sauces: [getSauce(rubs)] }, page));
    }

    // Build large fry orders
    for (let i=0; i < fries.large;i++) {
        orders.push(new Order({ type: 'Side Orders', order: 'Large Waffle Fries', sauces: [getSauce(rubs)] }, page));
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

    // Break up mesquite and cajun
    if (choice.includes('/')) {
        choice = choice.split('/')[Math.floor(Math.random()*2)];
    }

    previousRubs.push(choice);
    return choice;
}

async function addTip(page) {
    await waitThenClick(page, ADD_TIP_SELECTOR);
    await waitThenClick(page, TIP_BUTTON_SELECTOR);
    await waitThenClick(page, TIP_DONE_BUTTON_SELECTOR);
}
/* end helper functions */

/* Order class to create an order for a person */
class Order {
    constructor(person, page) {
        this.person = person;
        this.page = page;
    }

    async type() {
        const selector = TYPE_SELECTORS[this.person.type];
        await waitThenClick(this.page, selector);
    }

    async size() {
        const selector = SIZE_SELECTORS[this.person.order];
        await waitThenClick(this.page, selector);
    }

    async sauces() {
        for (const sauce of this.person.sauces) {
            const selector = ITEM_SELECTOR.replace('{0}', sauce);
            await waitThenClick(this.page, selector);
        }
    }

    async dressing() {
        const dressing = this.person.dressing || NO_DRESSING;
        const selector = ITEM_SELECTOR.replace('{0}', dressing);
        await waitThenClick(this.page, selector);
        
    }

    async done() {
        await waitThenClick(this.page, DONE_SELECTOR);
    }
}