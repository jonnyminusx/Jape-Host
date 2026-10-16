import { createClapMidiEvent } from '../clapMidi'
import type { MidiBus } from '../midiBus'

type MidiNameCallback = (names: string[]) => void

type MidiInputLike = {
  id: string
  name?: string
  onmidimessage: ((event: { data?: Uint8Array }) => void) | null
}

type MidiAccessLike = {
  inputs: { values: () => IterableIterator<MidiInputLike> }
  onstatechange: (() => void) | null
}

function listInputs(access: MidiAccessLike): MidiInputLike[] {
  return Array.from(access.inputs.values())
}

export async function connectWebMidi(
  midiBus: MidiBus,
  onDeviceNamesChanged: MidiNameCallback,
): Promise<() => void> {
  if (!('requestMIDIAccess' in navigator)) {
    onDeviceNamesChanged([])
    return () => {}
  }

  let midiAccess: MidiAccessLike
  try {
    midiAccess = (await (navigator as Navigator & {
      requestMIDIAccess: () => Promise<MidiAccessLike>
    }).requestMIDIAccess()) as MidiAccessLike
  } catch {
    onDeviceNamesChanged([])
    return () => {}
  }
  const updateNames = () => {
    const names = listInputs(midiAccess).map((input) => input.name ?? input.id)
    onDeviceNamesChanged(names)
  }

  const onMessage = (event: { data?: Uint8Array }) => {
    if (!event.data) {
      return
    }
    midiBus.emit({ bytes: createClapMidiEvent(new Uint8Array(event.data)) })
  }

  const bindInputs = () => {
    for (const input of listInputs(midiAccess)) {
      input.onmidimessage = onMessage
    }
    updateNames()
  }

  midiAccess.onstatechange = () => {
    bindInputs()
  }

  bindInputs()

  return () => {
    midiAccess.onstatechange = null
    for (const input of listInputs(midiAccess)) {
      input.onmidimessage = null
    }
  }
}
