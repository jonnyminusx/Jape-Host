const kClapEventSize = 24
const kClapCoreEventSpace = 0
const kClapEventMidi = 10

function makeEvent(status: number, data1: number, data2: number): Uint8Array {
  const event = new Uint8Array(kClapEventSize)
  const eventView = new DataView(event.buffer)
  eventView.setUint32(0, kClapEventSize, true)
  eventView.setUint32(4, 0, true)
  eventView.setUint16(8, kClapCoreEventSpace, true)
  eventView.setUint16(10, kClapEventMidi, true)
  eventView.setUint32(12, 0, true)
  eventView.setUint16(16, 0, true)
  event[18] = status & 0xff
  event[19] = data1 & 0x7f
  event[20] = data2 & 0x7f
  return event
}

export function createClapNoteOnEvent(note: number, velocity = 100): Uint8Array {
  return makeEvent(0x90, note, velocity)
}

export function createClapNoteOffEvent(note: number): Uint8Array {
  return makeEvent(0x80, note, 0)
}

export function createClapPanicEvents(): Uint8Array[] {
  return [
    makeEvent(0xb0, 123, 0),
    makeEvent(0xb0, 120, 0),
  ]
}

export function createClapMidiEvent(message: Uint8Array): Uint8Array {
  return makeEvent(message[0] ?? 0, message[1] ?? 0, message[2] ?? 0)
}
