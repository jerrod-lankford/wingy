import { fryCalc } from '../utils.js';

describe('fry calc', () => {
    it('tests 0 people', () => {
        const fries = fryCalc(0);

        expect(fries.small).toBe(0);
        expect(fries.large).toBe(0);
    });

    it('tests 1 people', () => {
        const fries = fryCalc(1);

        expect(fries.small).toBe(1);
        expect(fries.large).toBe(0);
    });

    it('tests 2 people', () => {
        const fries = fryCalc(2);

        expect(fries.small).toBe(0);
        expect(fries.large).toBe(1);
    });

    it('tests 3 people', () => {
        const fries = fryCalc(3);

        expect(fries.small).toBe(1);
        expect(fries.large).toBe(1);
    });

    it('tests 4 people', () => {
        const fries = fryCalc(4);

        expect(fries.small).toBe(0);
        expect(fries.large).toBe(2);
    });

    it('tests 5 people', () => {
        const fries = fryCalc(5);

        expect(fries.small).toBe(1);
        expect(fries.large).toBe(2);
    });

    it('tests 6 people', () => {
        const fries = fryCalc(6);

        expect(fries.small).toBe(0);
        expect(fries.large).toBe(3);
    });
});