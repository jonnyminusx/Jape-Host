export type MidiMessage = {
  bytes: Uint8Array
}

type MidiSubscriber = (message: MidiMessage) => void

export class MidiBus {
  private readonly subscribers = new Set<MidiSubscriber>()

  subscribe(subscriber: MidiSubscriber): () => void {
    this.subscribers.add(subscriber)
    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  emit(message: MidiMessage) {
    for (const subscriber of this.subscribers) {
      subscriber(message)
    }
  }
}
