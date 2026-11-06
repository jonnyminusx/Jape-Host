import { expect, describe, test } from "vitest"
import { keyToNote } from "./computerKeyboard";

interface KeyToNoteCase {
    key: string;
    firstNote: number;
    lastNote: number;
    expectedNote: number | undefined;
}

describe('keyToNote', () => {
    const cases: KeyToNoteCase[] = [
        { key: 'A', firstNote: 0, lastNote: 0, expectedNote: 0 },
        { key: 'a', firstNote: 0, lastNote: 0, expectedNote: 0 },
        { key: 'constructor', firstNote: 0, lastNote: 0, expectedNote: undefined },
        { key: 'B', firstNote: 0, lastNote: 0, expectedNote: undefined },
        { key: '!', firstNote: 0, lastNote: 0, expectedNote: undefined },
        { key: 'A', firstNote: -1, lastNote: -1, expectedNote: -1 },
        { key: 'A', firstNote: 1, lastNote: 0, expectedNote: undefined },
        { key: 'S', firstNote: 50, lastNote: 52, expectedNote: 52 },
        { key: 'S', firstNote: 50, lastNote: 51, expectedNote: undefined },
        { key: 'A', firstNote: 50, lastNote: 62, expectedNote: 50 },
        { key: 'W', firstNote: 50, lastNote: 62, expectedNote: 51 },
        { key: 'S', firstNote: 50, lastNote: 62, expectedNote: 52 },
        { key: 'E', firstNote: 50, lastNote: 62, expectedNote: 53 },
        { key: 'D', firstNote: 50, lastNote: 62, expectedNote: 54 },
        { key: 'F', firstNote: 50, lastNote: 62, expectedNote: 55 },
        { key: 'T', firstNote: 50, lastNote: 62, expectedNote: 56 },
        { key: 'G', firstNote: 50, lastNote: 62, expectedNote: 57 },
        { key: 'Y', firstNote: 50, lastNote: 62, expectedNote: 58 },
        { key: 'H', firstNote: 50, lastNote: 62, expectedNote: 59 },
        { key: 'U', firstNote: 50, lastNote: 62, expectedNote: 60 },
        { key: 'J', firstNote: 50, lastNote: 62, expectedNote: 61 },
        { key: 'K', firstNote: 50, lastNote: 62, expectedNote: 62 }
    ];

    test.each(cases)('$key maps to $expectedNote', ({ key, firstNote, lastNote, expectedNote }) => {
        expect(keyToNote(key, firstNote, lastNote)).toBe(expectedNote);
    });
});