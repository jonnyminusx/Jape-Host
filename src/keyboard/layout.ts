const kWhiteKeyWidth = 10;
const kWhiteKeyHeight = 50;
const kBlackKeyScaleFactor = 0.6;
const kBlackPitchClasses = new Set([1, 3, 6, 8, 10]);

export type KeyColour = "black" | "white";

export interface Key {
    readonly note: number;
    readonly x: number;
    readonly width: number;
    readonly height: number;
    readonly colour: KeyColour;
}

export interface ViewBox {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

export interface KeyboardSpec {
    readonly keys: Key[];
    readonly viewBox: ViewBox;
}

export function isBlackKey(note: number): boolean {
    return kBlackPitchClasses.has(note % 12);
}

export function isBlackColour(colour: KeyColour): boolean {
    return colour === "black";
}

function calculateViewBox(startNote: number, endNote: number, nWhiteKeys: number, blackKeyWidth: number, blackKeyHeight: number): ViewBox {
    const halfBlackKeyWidth = blackKeyWidth / 2;
    const startNoteIsBlack = isBlackKey(startNote);
    const endNoteIsBlack = isBlackKey(endNote);
    const x = startNoteIsBlack ? -halfBlackKeyWidth : 0;
    const y = 0;
    const width = -x + (kWhiteKeyWidth * nWhiteKeys) + (endNoteIsBlack ? halfBlackKeyWidth : 0);
    const height = nWhiteKeys > 0 ? kWhiteKeyHeight : blackKeyHeight;

    return { x, y, width, height };
}

export function buildKeyboardSpec(startNote: number, endNote: number): KeyboardSpec {
    const keys: Key[] = [];
    const blackWidth = kWhiteKeyWidth * kBlackKeyScaleFactor;
    const blackHeight = kWhiteKeyHeight * kBlackKeyScaleFactor;

    let whiteIndex = 0;
    for (let note = startNote; note <= endNote; ++note) {
        if (isBlackKey(note)) {
            const x = (kWhiteKeyWidth * whiteIndex) - blackWidth / 2;
            keys.push({ note, x, width: blackWidth, height: blackHeight, colour: "black" });
        }
        else {
            const x = kWhiteKeyWidth * whiteIndex;
            keys.push({ note, x, width: kWhiteKeyWidth, height: kWhiteKeyHeight, colour: "white" });
            ++whiteIndex;
        }
    }

    const viewBox = calculateViewBox(startNote, endNote, whiteIndex, blackWidth, blackHeight);

    return { keys, viewBox };
}
