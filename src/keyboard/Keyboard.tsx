import { useRef, useEffect } from 'react'
import { isBlackColour, buildKeyboardSpec, type Key } from "./layout";

export type ActiveNotes = ReadonlySet<number>;
type NoteHandler = (note: number) => void;
type PointerHandler = (pointer: number) => void;
type NoteAndPointerHandler = (note: number, pointer: number) => void;

interface KeyboardProps {
    firstNote: number;
    lastNote: number;
    activeNotes: ActiveNotes;
    panicCount: number;
    onNoteDown: NoteHandler;
    onNoteUp: NoteHandler;
}

interface KeyRectProps {
    keyData: Key;
    isActive: boolean;
    onNoteDown: NoteAndPointerHandler;
    onNoteUp: PointerHandler;
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
            onPointerDown={(event) => {
                if (event.button !== 0 || event.ctrlKey) {
                    return;
                }
                event.currentTarget.setPointerCapture(event.pointerId)
                onNoteDown(keyData.note, event.pointerId)
            }}
            onPointerUp={(event) => onNoteUp(event.pointerId)}
            onPointerCancel={(event) => onNoteUp(event.pointerId)}
            onLostPointerCapture={(event) => onNoteUp(event.pointerId)}
            onContextMenu={event => event.preventDefault()}
        />);
}

function renderKeys(keys: Key[], activeNotes: ActiveNotes, onNoteDown: NoteAndPointerHandler, onNoteUp: PointerHandler) {
    return keys.map(k => (<KeyRect
        key={k.note}
        keyData={k}
        isActive={activeNotes.has(k.note)}
        onNoteDown={onNoteDown}
        onNoteUp={onNoteUp} />));
}

function noteIsPointedTo(note: number, map: Map<number, number>): boolean {
    for (const candidateNote of map.values()) {
        if (candidateNote === note) {
            return true;
        }
    }
    return false;
}

export function Keyboard({ firstNote, lastNote, activeNotes, panicCount, onNoteDown, onNoteUp }: KeyboardProps) {
    const pointerToHeldNote = useRef<Map<number, number>>(new Map())

    useEffect(() => {
        pointerToHeldNote.current.clear()
    }, [panicCount])

    const spec = buildKeyboardSpec(firstNote, lastNote);
    const whiteKeys = spec.keys.filter(k => !isBlackColour(k.colour));
    const blackKeys = spec.keys.filter(k => isBlackColour(k.colour));

    const onNoteDownWrapper: NoteAndPointerHandler = (note: number, pointerId: number) => {
        const onNoteDownRequired = !noteIsPointedTo(note, pointerToHeldNote.current);

        const potentiallyOrphanedNote = pointerToHeldNote.current.get(pointerId);
        if (potentiallyOrphanedNote !== undefined && potentiallyOrphanedNote !== note) {
            pointerToHeldNote.current.delete(pointerId);
            if (!noteIsPointedTo(potentiallyOrphanedNote, pointerToHeldNote.current)) {
                onNoteUp(potentiallyOrphanedNote);
            }
        }

        pointerToHeldNote.current.set(pointerId, note);
        if (onNoteDownRequired) {
            onNoteDown(note);
        }
    }

    const onNoteUpWrapper: PointerHandler = (pointerId: number) => {
        const pointedToNote = pointerToHeldNote.current.get(pointerId);
        if (pointedToNote !== undefined) {
            pointerToHeldNote.current.delete(pointerId);

            if (!noteIsPointedTo(pointedToNote, pointerToHeldNote.current)) {
                onNoteUp(pointedToNote);
            }
        }
    }

    return (
        <svg viewBox={`${spec.viewBox.x} ${spec.viewBox.y} ${spec.viewBox.width} ${spec.viewBox.height}`}>
            {renderKeys(whiteKeys, activeNotes, onNoteDownWrapper, onNoteUpWrapper)}
            {renderKeys(blackKeys, activeNotes, onNoteDownWrapper, onNoteUpWrapper)}
        </svg>
    );
}