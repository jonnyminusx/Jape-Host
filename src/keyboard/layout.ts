import { noteToKey } from "./computerKeyboard";

const kWhiteKeyWidth = 10;
const kWhiteKeyHeight = 50;
const kBlackKeyScaleFactor = 0.6;
const kBlackPitchClasses = new Set([1, 3, 6, 8, 10]);

const kWhiteKeyLabelFontSize = kWhiteKeyWidth / 2;
const kWhiteKeyLabelX = kWhiteKeyLabelFontSize;
const kWhiteKeyLabelY = kWhiteKeyHeight - kWhiteKeyLabelX;

const kBlackKeyLabelFontSize = (kWhiteKeyWidth * kBlackKeyScaleFactor) / 2;
const kBlackKeyLabelX = kBlackKeyLabelFontSize;
const kBlackKeyLabelY = (kWhiteKeyHeight * kBlackKeyScaleFactor) - kBlackKeyLabelX;

export type KeyColour = "black" | "white";

export interface KeyLabel {
    readonly x: number;
    readonly y: number;
    readonly fontSize: number;
    readonly fontColour: string;
    readonly text: string;
}

export interface Key {
    readonly note: number;
    readonly x: number;
    readonly width: number;
    readonly height: number;
    readonly colour: KeyColour;
    readonly label: KeyLabel | undefined;
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

export function createKeyLabel(keyX: number, isBlack: boolean, keyOffset: number): KeyLabel | undefined {
    const computerKey = noteToKey(keyOffset);

    if (computerKey === undefined) {
        return undefined;
    }

    const text = computerKey.toUpperCase();

    if (isBlack) {
        const x = keyX + kBlackKeyLabelX;
        const y = kBlackKeyLabelY;
        const fontSize = kBlackKeyLabelFontSize;
        const fontColour = "#CCCCCC";
        return { x, y, fontSize, fontColour, text };
    }

    const x = keyX + kWhiteKeyLabelX;
    const y = kWhiteKeyLabelY;
    const fontSize = kWhiteKeyLabelFontSize;
    const fontColour = "#666666";
    return { x, y, fontSize, fontColour, text };
}

export function buildKeyboardSpec(startNote: number, endNote: number, showLabels: boolean): KeyboardSpec {
    const keys: Key[] = [];
    const blackWidth = kWhiteKeyWidth * kBlackKeyScaleFactor;
    const blackHeight = kWhiteKeyHeight * kBlackKeyScaleFactor;

    let whiteIndex = 0;
    for (let note = startNote; note <= endNote; ++note) {
        if (isBlackKey(note)) {
            const x = (kWhiteKeyWidth * whiteIndex) - blackWidth / 2;
            const label = showLabels ? createKeyLabel(x, true, note - startNote) : undefined;
            keys.push({ note, x, width: blackWidth, height: blackHeight, colour: "black", label });
        }
        else {
            const x = kWhiteKeyWidth * whiteIndex;
            const label = showLabels ? createKeyLabel(x, false, note - startNote) : undefined;
            keys.push({ note, x, width: kWhiteKeyWidth, height: kWhiteKeyHeight, colour: "white", label });
            ++whiteIndex;
        }
    }

    const viewBox = calculateViewBox(startNote, endNote, whiteIndex, blackWidth, blackHeight);

    return { keys, viewBox };
}
