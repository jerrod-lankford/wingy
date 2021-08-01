const { generatePayment } = require('../payment-utils');

describe('generate payment', () => {
    it('tests single order no fries', () => {
        const everyone = [{
            price: 9.99,
            fries: 'No'
        }];

        const payments = generatePayment(everyone, 2.00);
        expect(payments).toMatchSnapshot();
    });

    it('tests single order with fries', () => {
        const everyone = [{
            price: 9.99,
            fries: 'Yes'
        }];

        const payments = generatePayment(everyone, 3.00);
        expect(payments).toMatchSnapshot();
    });

    it('tests varying orders', () => {
        const everyone = [{
            price: 12.99,
            fries: 'Yes'
        },
        {
            price: 6.49,
            fries: 'No'
        },
        {
            price: 14.49,
            fries: 'No'
        },
        {
            price: 17.49,
            fries: 'Yes'
        }
    ];

        const payments = generatePayment(everyone, 5.00);
        expect(payments).toMatchSnapshot();
    });

    it('tests order with large fries', () => {
        const everyone = [{
            price: 9.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        },
        {
            price: 5.99,
            fries: 'Yes'
        }];

        const payments = generatePayment(everyone, 2.00);
        expect(payments).toMatchSnapshot();
    });

    it('tests order with 2 small fries', () => {
        const everyone = [{
            price: 9.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        },
        {
            price: 9.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        }];

        const payments = generatePayment(everyone, 3.00);
        expect(payments).toMatchSnapshot();
    });

    it('tests order with small and large fries', () => {
        const everyone = [{
            price: 9.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        },
        {
            price: 9.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        },
        {
            price: 12.99,
            fries: 'Yes'
        }];

        const payments = generatePayment(everyone, 3.00);
        expect(payments).toMatchSnapshot();
    });
});