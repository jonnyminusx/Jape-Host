import { useRef, useEffect, useState } from 'react'
import { isBlackColour, buildKeyboardSpec, type Key } from "./layout";
import { calculateVelocity } from "./pointer"

export type ActiveNotes = ReadonlySet<number>;
type NoteHandler = (note: number) => void;
type PointerHandler = (pointer: number) => void;
type NoteVelocityHandler = (note: number, velocity: number) => void;
type NoteVelocityPointerHandler = (note: number, velocity: number, pointer: number) => void;

interface KeyboardProps {
    firstNote: number;
    lastNote: number;
    activeNotes: ActiveNotes;
    panicCount: number;
    onNoteDown: NoteVelocityHandler;
    onNoteUp: NoteHandler;
}

interface KeyRectProps {
    keyData: Key;
    isActive: boolean;
    onNoteDown: NoteVelocityPointerHandler;
    onNoteUp: PointerHandler;
}

function calculateVelocityFromEvent(event: React.PointerEvent<SVGRectElement>) {
    const y = event.clientY;
    const bb = event.currentTarget.getBoundingClientRect();
    return calculateVelocity(y, bb.top, bb.height);
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
                onNoteDown(keyData.note, calculateVelocityFromEvent(event), event.pointerId)
            }}
            onPointerUp={(event) => onNoteUp(event.pointerId)}
            onPointerCancel={(event) => onNoteUp(event.pointerId)}
            onLostPointerCapture={(event) => onNoteUp(event.pointerId)}
            onContextMenu={event => event.preventDefault()}
        />);
}

function renderKeys(keys: Key[], activeNotes: ActiveNotes, onNoteDown: NoteVelocityPointerHandler, onNoteUp: PointerHandler) {
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
    const [computerKeyboardEnabled, setComputerKeyboardEnabled] = useState<boolean>(true);
    const pointerToHeldNote = useRef<Map<number, number>>(new Map());

    useEffect(() => {
        pointerToHeldNote.current.clear();
    }, [panicCount])

    const spec = buildKeyboardSpec(firstNote, lastNote);
    const whiteKeys = spec.keys.filter(k => !isBlackColour(k.colour));
    const blackKeys = spec.keys.filter(k => isBlackColour(k.colour));

    const onNoteDownWrapper: NoteVelocityPointerHandler = (note: number, velocity: number, pointerId: number) => {
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
            onNoteDown(note, velocity);
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
        <>
            <label>
                <input type="checkbox" checked={computerKeyboardEnabled} onChange={e => setComputerKeyboardEnabled(e.target.checked)} />
                Computer Keyboard
            </label>
            <svg viewBox={`${spec.viewBox.x} ${spec.viewBox.y} ${spec.viewBox.width} ${spec.viewBox.height}`}>
                {renderKeys(whiteKeys, activeNotes, onNoteDownWrapper, onNoteUpWrapper)}
                {renderKeys(blackKeys, activeNotes, onNoteDownWrapper, onNoteUpWrapper)}
            </svg>
        </>
    );
}