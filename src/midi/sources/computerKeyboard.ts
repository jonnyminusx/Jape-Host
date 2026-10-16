import { createClapNoteOffEvent, createClapNoteOnEvent } from '../clapMidi'
import type { MidiBus } from '../midiBus'

const kBaseNote = 60
const kNoteMap: Record<string, number> = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
}

export function bindComputerKeyboard(midiBus: MidiBus): () => void {
  const pressed = new Set<string>()

  const onKeyDown = (event: KeyboardEvent) => {
    const delta = kNoteMap[event.key.toLowerCase()]
    if (delta === undefined) {
      return
    }
    event.preventDefault()
    if (pressed.has(event.key)) {
      return
    }
    pressed.add(event.key)
    midiBus.emit({ bytes: createClapNoteOnEvent(kBaseNote + delta) })
  }

  const onKeyUp = (event: KeyboardEvent) => {
    const delta = kNoteMap[event.key.toLowerCase()]
    if (delta === undefined) {
      return
    }
    event.preventDefault()
    pressed.delete(event.key)
    midiBus.emit({ bytes: createClapNoteOffEvent(kBaseNote + delta) })
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }
}
