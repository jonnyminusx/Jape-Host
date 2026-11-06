import { useRef, useEffect, useState } from 'react'
import { isBlackColour, buildKeyboardSpec, type Key } from "./layout";
import { calculateVelocity } from "./pointer"
import { keyToNote } from "./computerKeyboard"
import { HeldNotes, toComputerKeyboardInput, toPointerInput, type Input, type InputHandler, type NoteHandler, type NoteVelocityHandler, type NoteVelocityInputHandler } from "./input"

export type ActiveNotes = ReadonlySet<number>;

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
    onNoteDown: NoteVelocityInputHandler;
    onNoteUp: InputHandler;
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
                onNoteDown(keyData.note, calculateVelocityFromEvent(event), toPointerInput(event.pointerId))
            }}
            onPointerUp={(event) => onNoteUp(toPointerInput(event.pointerId))}
            onPointerCancel={(event) => onNoteUp(toPointerInput(event.pointerId))}
            onLostPointerCapture={(event) => onNoteUp(toPointerInput(event.pointerId))}
            onContextMenu={event => event.preventDefault()}
        />);
}

function renderKeys(keys: Key[], activeNotes: ActiveNotes, onNoteDown: NoteVelocityInputHandler, onNoteUp: InputHandler) {
    return keys.map(k => (<KeyRect
        key={k.note}
        keyData={k}
        isActive={activeNotes.has(k.note)}
        onNoteDown={onNoteDown}
        onNoteUp={onNoteUp} />));
}

export function Keyboard({ firstNote, lastNote, activeNotes, panicCount, onNoteDown, onNoteUp }: KeyboardProps) {
    const [computerKeyboardEnabled, setComputerKeyboardEnabled] = useState<boolean>(true);
    const heldNotes = useRef<HeldNotes>(new HeldNotes(onNoteDown, onNoteUp));

    const onKeyDown = (event: KeyboardEvent) => {
        const note = keyToNote(event.key, firstNote, lastNote);
        if (note !== undefined) {
            event.preventDefault();
            heldNotes.current.onInputHeld(note, 100, toComputerKeyboardInput(event.key));
        }
    }

    const onKeyUp = (event: KeyboardEvent) => {
        const note = keyToNote(event.key, firstNote, lastNote);
        if (note !== undefined) {
            heldNotes.current.onInputReleased(toComputerKeyboardInput(event.key));
        }
    }

    useEffect(() => {
        heldNotes.current.onNoteDown = onNoteDown;
        heldNotes.current.onNoteUp = onNoteUp;
    }, [onNoteDown, onNoteUp])

    useEffect(() => {
        heldNotes.current.releaseAll();
    }, [panicCount])

    useEffect(() => {
        if (computerKeyboardEnabled) {
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
        }

        return () => {
            heldNotes.current.releaseComputerKeyboard();
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        }
    }, [computerKeyboardEnabled, firstNote, lastNote])

    const spec = buildKeyboardSpec(firstNote, lastNote);
    const whiteKeys = spec.keys.filter(k => !isBlackColour(k.colour));
    const blackKeys = spec.keys.filter(k => isBlackColour(k.colour));

    const onNoteDownWrapper: NoteVelocityInputHandler = (note: number, velocity: number, input: Input) => {
        heldNotes.current.onInputHeld(note, velocity, input);
    }

    const onNoteUpWrapper: InputHandler = (input: Input) => {
        heldNotes.current.onInputReleased(input);
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