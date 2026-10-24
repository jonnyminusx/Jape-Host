import { describe, expect, test } from 'vitest';
import { isBlackKey, buildKeys } from './layout.ts';

interface IsBlackCase {
    note: number;
    expected: boolean;
}

const cases: IsBlackCase[] = [
    { note: 60, expected: false }, // C
    { note: 61, expected: true },  // C#
    { note: 62, expected: false }, // D
    { note: 63, expected: true },  // D#
    { note: 64, expected: false }, // E
    { note: 65, expected: false }, // F
    { note: 66, expected: true },  // F#
    { note: 67, expected: false }, // G
    { note: 68, expected: true },  // G#
    { note: 69, expected: false }, // A
    { note: 70, expected: true },  // A#
    { note: 71, expected: false }, // B
];

describe('isBlackKey', () => {
    test.each(cases)('note $note is black: $expected', ({ note, expected }) => {
        expect(isBlackKey(note)).toBe(expected);
    });
});

describe('buildKeys', () => {
    describe('for notes 48 to 72', () => {
        const keys = buildKeys(48, 72);

        test('has 15 white keys', () => {
            expect(keys.filter(k => !k.isBlack)).toHaveLength(15);
        });

        test('has 10 black keys', () => {
            expect(keys.filter(k => k.isBlack)).toHaveLength(10);
        });

        test('centres each black key on the right edge of the white key before it', () => {
            for (const [i, key] of keys.entries()) {
                if (key.isBlack && i > 0) {
                    const previousKey = keys[i - 1];
                    const previousKeyRightEdge = previousKey.x + previousKey.width;
                    const keyCentre = key.x + (key.width / 2);

                    expect(previousKey.isBlack).toBe(false);
                    expect(keyCentre).toBe(previousKeyRightEdge);
                }
            }
        });
    });

    test('places a lone white key at x = 0', () => {
        const keys = buildKeys(60, 60);
        expect(keys.length).toBe(1);
        expect(keys[0].isBlack).toBe(false);
        expect(keys[0].x).toBe(0);
    });

    test('centres a lone black key on x = 0', () => {
        const keys = buildKeys(61, 61);
        expect(keys).toHaveLength(1);

        const key = keys[0];
        expect(key.isBlack).toBe(true);
        expect(key.x + (key.width / 2)).toBeCloseTo(0);
    });
});
