import { describe, expect, test } from 'vitest';
import { calculateVelocity } from './pointer';

interface CalculateVelocityCase {
    y: number;
    top: number;
    height: number;
    expectedVelocity: number;
}

describe('calculateVelocity', () => {
    const cases: CalculateVelocityCase[] = [
        { y: 0, top: 0, height: 50, expectedVelocity: 1 },
        { y: -1, top: 0, height: 50, expectedVelocity: 1 },
        { y: 25, top: 0, height: 50, expectedVelocity: 64 },
        { y: 50, top: 0, height: 50, expectedVelocity: 127 },
        { y: 51, top: 0, height: 50, expectedVelocity: 127 },

        { y: 50, top: 50, height: 50, expectedVelocity: 1 },
        { y: 49, top: 50, height: 50, expectedVelocity: 1 },
        { y: 75, top: 50, height: 50, expectedVelocity: 64 },
        { y: 100, top: 50, height: 50, expectedVelocity: 127 },
        { y: 101, top: 50, height: 50, expectedVelocity: 127 },

        { y: 0, top: 0, height: 0, expectedVelocity: 1 },
        { y: 0, top: 0, height: -1, expectedVelocity: 1 }
    ];

    test.each(cases)('for $y is $expectedVelocity', ({ y, top, height, expectedVelocity }) => {
        expect(calculateVelocity(y, top, height)).toBe(expectedVelocity);
    });
});
