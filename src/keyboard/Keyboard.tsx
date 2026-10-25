import { isBlackColour, buildKeyboardSpec, type Key } from "./layout";

interface KeyboardProps {
    firstNote: number;
    lastNote: number;
    onNoteDown(note: number): void;
    onNoteUp(note: number): void;
}

interface KeyRectProps {
    keyData: Key;
    onNoteDown(note: number): void;
    onNoteUp(note: number): void;
}

function KeyRect({ keyData, onNoteDown, onNoteUp }: KeyRectProps) {
    return (
        <rect
            x={keyData.x}
            y={0}
            width={keyData.width}
            height={keyData.height}
            fill={keyData.colour}
            stroke="#333"
            strokeWidth={0.3}
            rx="1"
            onPointerDown={() => onNoteDown(keyData.note)}
            onPointerUp={() => onNoteUp(keyData.note)}
        />);
}

export function Keyboard({ firstNote, lastNote, onNoteDown, onNoteUp }: KeyboardProps) {
    const spec = buildKeyboardSpec(firstNote, lastNote);
    const whiteKeys = spec.keys.filter(k => !isBlackColour(k.colour));
    const blackKeys = spec.keys.filter(k => isBlackColour(k.colour));

    return (
        <svg viewBox={`${spec.viewBox.x} ${spec.viewBox.y} ${spec.viewBox.width} ${spec.viewBox.height}`}>
            {
                whiteKeys.map(k => (<KeyRect key={k.note} keyData={k} onNoteDown={onNoteDown} onNoteUp={onNoteUp} />))
            }
            {
                blackKeys.map(k => (<KeyRect key={k.note} keyData={k} onNoteDown={onNoteDown} onNoteUp={onNoteUp} />))
            }
        </svg >

    );
}