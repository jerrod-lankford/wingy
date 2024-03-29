import { generatePayment } from '../payment-utils.js';
import orders from './mockOrders.json';

describe('generate payment for delivery', (everyone) => {
    it.each([
        ['single order no fries'],
        ['single order with fries'],
        ['varying orders'],
        ['order with large fries'],
        ['order with 4 fries'],
        ['order with 5 fries']
    ])('%s', name => {
        const everyone = orders[name];
        const payments = generatePayment(everyone, 2.00, true);
        expect(payments).toMatchSnapshot();
    });
});

describe('generate payment for pickup', (everyone) => {
    it.each([
        ['single order no fries'],
        ['single order with fries'],
        ['varying orders'],
        ['order with large fries'],
        ['order with 4 fries'],
        ['order with 5 fries']
    ])('%s', name => {
        const everyone = orders[name];
        const payments = generatePayment(everyone, 2.00, false);
        expect(payments).toMatchSnapshot();
    });
});