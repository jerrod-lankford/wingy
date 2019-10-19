
const puppeteer = require('puppeteer');

const NO_DRESSING = 'No Dressing';

const MENU = 'https://wingsoverraleigh.foodtecsolutions.com/menu';

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
};

const ITEM_SELECTOR = "span[title='{0}']";

const DONE_SELECTOR = 'button.item-edit-done';

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

    // TODO Automatic fry ordering?
    // type();
    // fries();
    // done();
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