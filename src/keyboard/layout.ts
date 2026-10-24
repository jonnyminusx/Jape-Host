const kWhiteKeyWidth = 10;
const kWhiteKeyHeight = 50;
const kBlackKeyScaleFactor = 0.6;
const kBlackPitchClasses = new Set([1, 3, 6, 8, 10]);

export function isBlackKey(note: number): boolean {
    return kBlackPitchClasses.has(note % 12);
}

export interface Key {
    readonly note: number;
    readonly x: number;
    readonly width: number;
    readonly height: number;
    readonly isBlack: boolean;
}

export function buildKeys(startNote: number, endNote: number): readonly Key[] {
    const keys: Key[] = [];
    const blackWidth = kWhiteKeyWidth * kBlackKeyScaleFactor;
    const blackHeight = kWhiteKeyHeight * kBlackKeyScaleFactor;

    let whiteIndex = 0;
    for (let note = startNote; note <= endNote; ++note) {
        if (isBlackKey(note)) {
            const x = (kWhiteKeyWidth * whiteIndex) - blackWidth / 2;
            keys.push({ note, x, width: blackWidth, height: blackHeight, isBlack: true });
        }
        else {
            const x = kWhiteKeyWidth * whiteIndex;
            keys.push({ note, x, width: kWhiteKeyWidth, height: kWhiteKeyHeight, isBlack: false });
            ++whiteIndex;
        }
    }

    return keys;
}
