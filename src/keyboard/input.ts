import { type ComputerKey } from "./computerKeyboard";
import { type PointerId } from "./pointer";

export type Note = number;
export type Velocity = number;

export type PointerInput = { kind: 'pointer'; id: PointerId };
export type ComputerKeyboardInput = { kind: 'computer'; key: ComputerKey };
export type Input = PointerInput | ComputerKeyboardInput;
export type InputString = string;

export type NoteHandler = (note: Note) => void;
export type InputHandler = (input: Input) => void;
export type NoteVelocityHandler = (note: Note, velocity: number) => void;
export type NoteVelocityInputHandler = (note: Note, velocity: number, input: Input) => void;

export function toPointerInput(pointer: PointerId): PointerInput {
    return { kind: 'pointer', id: pointer };
}

export function toComputerKeyboardInput(key: string): ComputerKeyboardInput {
    return { kind: 'computer', key: key.toLowerCase() };
}

function toInputString(input: Input): InputString {
    return input.kind === 'pointer' ? `pointer:${input.id}` : `computer:${input.key}`;
}

export class HeldNotes {
    constructor(onNoteDown: NoteVelocityHandler, onNoteUp: NoteHandler) {
        this.held = new Map();
        this.onNoteDown = onNoteDown;
        this.onNoteUp = onNoteUp;
    }

    releaseAll() {
        this.held.forEach((_inputs, note) => { this.onNoteUp(note); });
        this.held.clear();
    }

    releaseComputerKeyboard() {
        for (const [note, inputs] of this.held.entries()) {
            const filteredInputs = inputs.filter(x => !x.startsWith("computer"));
            if (filteredInputs.length === 0) {
                this.onNoteUp(note);
                this.held.delete(note);
            } else if (filteredInputs.length !== inputs.length) {
                this.held.set(note, filteredInputs);
            }
        }
    }

    onInputHeld(note: Note, velocity: Velocity, input: Input): void {
        const onNoteDownRequired = !this.isHeld(note);

        this.releaseOrphanedNotes(note, input);
        this.hold(note, input);

        if (onNoteDownRequired) {
            this.onNoteDown(note, velocity);
        }
    }

    onInputReleased(input: Input): void {
        this.releaseNotes(this.isHolding(input), input);
    }

    toString(): string {
        let output = "";
        for (const [candidateNote, inputs] of this.held) {
            output += candidateNote + "-->" + inputs + ", ";
        }
        return output;
    }

    private isHeld(note: Note): boolean {
        return this.held.has(note);
    }

    private isHolding(input: Input): Note[] {
        const held: Note[] = [];
        for (const [note, candidateInputs] of this.held.entries()) {
            if (candidateInputs.includes(toInputString(input))) {
                held.push(note);
            }
        }
        return held;
    }

    private releaseOrphanedNotes(note: Note, input: Input): void {
        const orphanedNotes = this.isHolding(input).filter(x => x !== note);
        this.releaseNotes(orphanedNotes, input);
    }

    private releaseInputString(inputString: InputString): void {
        for (const [note, candidateInputs] of this.held) {
            const remaining = candidateInputs.filter(x => x !== inputString);
            if (remaining.length === 0) {
                this.held.delete(note);
            } else if (remaining.length !== candidateInputs.length) {
                this.held.set(note, remaining);
            }
        }
    }

    private releaseInput(input: Input): void {
        this.releaseInputString(toInputString(input));
    }

    private releaseNotes(notes: Note[], input: Input): void {
        if (notes.length !== 0) {
            this.releaseInput(input);
        }

        for (const note of notes) {
            if (!this.isHeld(note)) {
                this.onNoteUp(note);
            }
        }
    }

    private hold(note: Note, input: Input): void {
        if (this.isHolding(input).includes(note)) {
            return;
        }

        const existingInputs = this.held.get(note)
        if (existingInputs !== undefined) {
            existingInputs.push(toInputString(input));
        }
        else {
            this.held.set(note, [toInputString(input)]);
        }
    }

    private held: Map<Note, InputString[]>;
    onNoteDown: NoteVelocityHandler;
    onNoteUp: NoteHandler;
}
