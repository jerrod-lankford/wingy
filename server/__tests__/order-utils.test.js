import { validateOrder } from '../order-utils.js';

describe('order missing', () => {
  it('tests missing order', () => {
    const response = validateOrder();
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests missing price', () => {
    const order = {
      item: '2 Tenders', type: 'Tenders', sauces: ['Sweet fire'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests missing size', () => {
    const order = {
      price: 12.99, type: 'Tenders', sauces: ['Sweet fire'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests missing sauces', () => {
    const order = {
      price: 12.99, item: '4 Wings', type: 'Wings', dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests missing dressing', () => {
    const order = {
      price: 12.99, item: '2 Wings', type: 'Wings', sauces: ['Sweet fire'],
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests missing type', () => {
    const order = {
      price: 12.99, item: '2 Wings', dressing: 'None', sauces: ['Sweet fire'],
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Please fill in required fields: Order, sauces, and dressing.');
  });

  it('tests wrong order type', () => {
    const order = {
      price: 12.99, item: '2 Blah', type: 'blah', dressing: 'None', sauces: ['Sweet fire'],
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: Order type \'blah\' not recognized.');
  });
});

describe('one sauce', () => {
  it('tests 2 Tenders', () => {
    const order = {
      price: 6.99, item: '2 Tenders', type: 'Tenders', sauces: ['Sweet fire', 'Cajun'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 2 Tenders you are only allowed to have 1 sauce.');
  });

  it('tests 4 Tenders', () => {
    const order = {
      price: 6.99, item: '4 Tenders', type: 'Tenders', sauces: ['Sweet fire', 'Cajun'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 4 Tenders you are only allowed to have 1 sauce.');
  });

  it('tests 6 Wings', () => {
    const order = {
      price: 6.99, item: '6 Wings', type: 'Wings', sauces: ['Sweet fire', 'Cajun'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 6 Wings you are only allowed to have 1 sauce.');
  });

  it('works', () => {
    const order = {
      price: 6.99, item: '2 Tenders', type: 'Tenders', sauces: ['Sweet fire'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':white_check_mark: Order placed: 2 Tenders - Sweet fire - Ranch - No community fries!\n'
        + 'If you change your mind you can order again to update your current order.');
  });
});

describe('two sauces', () => {
  it('tests 6 Tenders', () => {
    const order = {
      price: 6.99, item: '6 Tenders', type: 'Tenders', sauces: ['Sweet fire', 'Cajun', 'Lemon Pepper'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 6 Tenders you are only allowed to have up to 2 sauces.');
  });

  it('tests 8 Tenders', () => {
    const order = {
      price: 6.99, item: '8 Tenders', type: 'Tenders', sauces: ['Sweet fire', 'Cajun', 'Lemon Pepper'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 8 Tenders you are only allowed to have up to 2 sauces.');
  });

  it('tests 9 Wings', () => {
    const order = {
      price: 6.99, item: '9 Wings', type: 'Wings', sauces: ['Sweet fire', 'Cajun', 'Lemon Pepper'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 9 Wings you are only allowed to have up to 2 sauces.');
  });

  it('tests 12 Wings', () => {
    const order = {
      price: 6.99, item: '12 Wings', type: 'Wings', sauces: ['Sweet fire', 'Cajun', 'Lemon Pepper'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With 12 Wings you are only allowed to have up to 2 sauces.');
  });

  it('tests Madness Meal', () => {
    const order = {
      price: 6.99, item: 'Madness Meal /w Fries', type: 'Specials', sauces: ['Sweet fire', 'Cajun', 'Lemon Pepper'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':x: With the Madness Meal you are only allowed to have up to 2 sauces.');
  });

  it('works', () => {
    const order = {
      price: 6.99, item: '9 Wings', type: 'Wings', sauces: ['Sweet fire', 'Cajun'], dressing: 'Ranch',
    };
    const response = validateOrder(order);
    expect(response).toBe(':white_check_mark: Order placed: 9 Wings - Sweet fire, Cajun - Ranch - No community fries!\n'
      + 'If you change your mind you can order again to update your current order.');
  });
});

describe('happy paths', () => {
  it('tests new order', () => {
    const order = {
      price: 6.99, item: '8 Tenders', type: 'Tenders', sauces: ['Sweet fire', 'Cajun'], dressing: 'Bleu Cheese',
    };
    const response = validateOrder(order);
    expect(response).toBe(':white_check_mark: Order placed: 8 Tenders - Sweet fire, Cajun - Bleu Cheese - No community fries!\n'
      + 'If you change your mind you can order again to update your current order.');
  });

  it('tests order completed before', () => {
    const order = {
      price: 6.99, item: '12 Wings', type: 'Wings', sauces: ['Sweet fire', 'Cajun'], dressing: 'Ranch', completed_before: true,
    };
    const response = validateOrder(order);
    expect(response).toBe(':white_check_mark: Order successfully updated: 12 Wings - Sweet fire, Cajun - Ranch - No community fries!');
  });

  it('tests yes fries', () => {
    const order = {
      price: 6.99, item: '6 Wings', type: 'Wings', sauces: ['Sweet fire'], dressing: 'Ranch', fries: 'Yes',
    };
    const response = validateOrder(order);
    expect(response).toBe(':white_check_mark: Order placed: 6 Wings - Sweet fire - Ranch - Yes community fries!\n'
      + 'If you change your mind you can order again to update your current order.');
  });
});
