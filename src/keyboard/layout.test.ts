import { describe, expect, test } from 'vitest';
import { isBlackKey, isBlackColour, buildKeyboardSpec, type KeyColour } from './layout.ts';

interface IsBlackCase {
    note: number;
    colour: KeyColour;
}

describe('isBlackKey', () => {
    const cases: IsBlackCase[] = [
        { note: 60, colour: "white" }, // C
        { note: 61, colour: "black" }, // C#
        { note: 62, colour: "white" }, // D
        { note: 63, colour: "black" }, // D#
        { note: 64, colour: "white" }, // E
        { note: 65, colour: "white" }, // F
        { note: 66, colour: "black" }, // F#
        { note: 67, colour: "white" }, // G
        { note: 68, colour: "black" }, // G#
        { note: 69, colour: "white" }, // A
        { note: 70, colour: "black" }, // A#
        { note: 71, colour: "white" }, // B
    ];

    test.each(cases)('note $note is $colour', ({ note, colour }) => {
        expect(isBlackKey(note)).toBe(isBlackColour(colour));
    });
});

describe('buildKeyboardSpec', () => {
    describe('for notes 48 to 72', () => {
        const spec = buildKeyboardSpec(48, 72);
        const keys = spec.keys;

        test('has 15 white keys', () => {
            expect(keys.filter(k => !isBlackColour(k.colour))).toHaveLength(15);
        });

        test('has 10 black keys', () => {
            expect(keys.filter(k => isBlackColour(k.colour))).toHaveLength(10);
        });

        test('centres each black key on the right edge of the white key before it', () => {
            for (const [i, key] of keys.entries()) {
                if (isBlackColour(key.colour) && i > 0) {
                    const previousKey = keys[i - 1];
                    const previousKeyRightEdge = previousKey.x + previousKey.width;
                    const keyCentre = key.x + (key.width / 2);

                    expect(previousKey.colour).toBe("white");
                    expect(keyCentre).toBe(previousKeyRightEdge);
                }
            }
        });

        test('viewBox is (x=0 y=0 width=150 height=50)', () => {
            const viewBox = spec.viewBox;
            expect(viewBox.x).toBe(0);
            expect(viewBox.y).toBe(0);
            expect(viewBox.width).toBe(150);
            expect(viewBox.height).toBe(50);
        });
    });

    describe('viewBox', () => {
        test('contains leading black key', () => {
            const viewBox = buildKeyboardSpec(61, 62).viewBox;
            expect(viewBox.x).toBe(-3);
            expect(viewBox.y).toBe(0);
            expect(viewBox.width).toBe(13);
            expect(viewBox.height).toBe(50);
        });

        test('contains trailing black key', () => {
            const viewBox = buildKeyboardSpec(60, 61).viewBox;
            expect(viewBox.x).toBe(0);
            expect(viewBox.y).toBe(0);
            expect(viewBox.width).toBe(13);
            expect(viewBox.height).toBe(50);
        });
    })

    test('places a lone white key at x = 0', () => {
        const keys = buildKeyboardSpec(60, 60).keys;
        expect(keys).toHaveLength(1);
        expect(keys[0].colour).toBe("white");
        expect(keys[0].x).toBe(0);
    });

    test('centres a lone black key on x = 0', () => {
        const keys = buildKeyboardSpec(61, 61).keys;
        expect(keys).toHaveLength(1);

        const key = keys[0];
        expect(key.colour).toBe("black");
        expect(key.x + (key.width / 2)).toBeCloseTo(0);
    });
});
