import { isBlackColour, buildKeyboardSpec, type Key } from "./layout";

type NoteHandler = (note: number) => void;

interface KeyboardProps {
    firstNote: number;
    lastNote: number;
    activeNotes: ReadonlySet<number>;
    onNoteDown: NoteHandler;
    onNoteUp: NoteHandler;
}

interface KeyRectProps {
    keyData: Key;
    isActive: boolean;
    onNoteDown: NoteHandler;
    onNoteUp: NoteHandler;
}

function KeyRect({ keyData, isActive, onNoteDown, onNoteUp }: KeyRectProps) {
    return (
        <rect
            x={keyData.x}
            y={0}
            width={keyData.width}
            height={keyData.height}
            fill={isActive ? "orange" : keyData.colour}
            stroke="#333"
            strokeWidth={0.3}
            rx="1"
            onPointerDown={() => onNoteDown(keyData.note)}
            onPointerUp={() => onNoteUp(keyData.note)}
        />);
}

function renderKeys(keys: Key[], activeNotes: ReadonlySet<number>, onNoteDown: NoteHandler, onNoteUp: NoteHandler) {
    return keys.map(k => (<KeyRect
        key={k.note}
        keyData={k}
        isActive={activeNotes.has(k.note)}
        onNoteDown={onNoteDown}
        onNoteUp={onNoteUp} />));
}

export function Keyboard({ firstNote, lastNote, activeNotes, onNoteDown, onNoteUp }: KeyboardProps) {
    const spec = buildKeyboardSpec(firstNote, lastNote);
    const whiteKeys = spec.keys.filter(k => !isBlackColour(k.colour));
    const blackKeys = spec.keys.filter(k => isBlackColour(k.colour));

    return (
        <svg viewBox={`${spec.viewBox.x} ${spec.viewBox.y} ${spec.viewBox.width} ${spec.viewBox.height}`}>
            {renderKeys(whiteKeys, activeNotes, onNoteDown, onNoteUp)}
            {renderKeys(blackKeys, activeNotes, onNoteDown, onNoteUp)}
        </svg>
    );
}