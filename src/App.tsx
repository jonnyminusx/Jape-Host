import { useEffect, useMemo, useRef, useState } from 'react'
import { kChainConfig } from './config/chain'
import { buildChain, type BuiltChain } from './engine/chain'
import { WclapRuntime } from './engine/runtime'
import {
  createClapNoteOffEvent,
  createClapNoteOnEvent,
  createClapPanicEvents,
} from './midi/clapMidi'
import { MidiBus } from './midi/midiBus'
import { bindComputerKeyboard } from './midi/sources/computerKeyboard'
import { connectWebMidi } from './midi/sources/webMidi'
import { Keyboard } from './keyboard/Keyboard'
import './App.css'

function App() {
  const runtimeRef = useRef<WclapRuntime | null>(null)
  const chainRef = useRef<BuiltChain | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [activeNotes, setActiveNotes] = useState<ReadonlySet<number>>(new Set())
  const [status, setStatus] = useState('Click start to load the host.')
  const [started, setStarted] = useState(false)
  const [midiInputs, setMidiInputs] = useState<string[]>([])
  const midiBus = useMemo(() => new MidiBus(), [])
  const [panicCount, setPanicCount] = useState(0)

  const panic = () => {
    const midiTarget = chainRef.current?.midiTarget
    if (!midiTarget) {
      return
    }
    midiTarget.sendEvents(createClapPanicEvents())
    setActiveNotes(new Set())
    setPanicCount(c => c + 1)
  }

  useEffect(() => {
    if (!started) {
      return
    }

    let stopKeyboard: (() => void) | null = null
    let stopWebMidi: (() => void) | null = null
    let cancelled = false

    const start = async () => {
      try {
        setStatus('Starting audio...')
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext
        await audioContext.resume()

        const runtime = new WclapRuntime()
        runtimeRef.current = runtime

        setStatus('Loading plugin chain...')
        const chain = await buildChain(runtime, audioContext, kChainConfig)
        chain.output.connect(audioContext.destination)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        chain.output.connect(analyser)
          ; (window as Window & { __japeHostAnalyser?: AnalyserNode }).__japeHostAnalyser =
            analyser
        chainRef.current = chain

        for (const plugin of chain.plugins) {
          const container = panelRefs.current[plugin.config.id]
          if (!container) {
            continue
          }
          container.replaceChildren()
          const iframe = await plugin.openPanel()
          if (iframe) {
            container.append(iframe)
          }
        }

        midiBus.subscribe((midi) => {
          chain.midiTarget.sendEvents([midi.bytes])
        })

        stopKeyboard = bindComputerKeyboard(midiBus)
        stopWebMidi = await connectWebMidi(midiBus, (names) => {
          if (!cancelled) {
            setMidiInputs(names)
          }
        })

        window.addEventListener('blur', panic)
        setStatus('Ready')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to start host.'
        setStatus(message)
      }
    }

    void start()

    return () => {
      cancelled = true
      window.removeEventListener('blur', panic)
      stopKeyboard?.()
      stopWebMidi?.()
      panic()
      chainRef.current?.dispose()
      chainRef.current = null
      void audioContextRef.current?.close()
      audioContextRef.current = null
    }
  }, [started, midiBus])

  const playNote = (note: number, velocity: number) => {
    setActiveNotes(prev => {
      if (prev.has(note)) {
        return prev
      }

      const next = new Set(prev)
      next.add(note)

      return next
    })

    chainRef.current?.midiTarget?.sendEvents([createClapNoteOnEvent(note, velocity)])
  }

  const releaseNote = (note: number) => {
    setActiveNotes(prev => {
      if (!prev.has(note)) {
        return prev
      }

      const next = new Set(prev)
      next.delete(note)

      return next
    })

    chainRef.current?.midiTarget?.sendEvents([createClapNoteOffEvent(note)])
  }

  return (
    <main>
      <header>
        <h1>Jape Host</h1>
        <p>{status}</p>
        {!started ? (
          <button type="button" onClick={() => setStarted(true)}>
            Start audio
          </button>
        ) : (
          <button type="button" onClick={panic}>
            Panic (all notes off)
          </button>
        )}
      </header>

      <section className="midi">
        <h2>MIDI inputs</h2>
        <p>{midiInputs.length > 0 ? midiInputs.join(', ') : 'No device connected'}</p>
        <p>Computer keyboard: A/W/S/E/D/F/T/G/Y/H/U/J/K</p>
      </section>

      <section className="keyboard">
        <Keyboard
          firstNote={48}
          lastNote={72}
          activeNotes={activeNotes}
          panicCount={panicCount}
          onNoteDown={playNote}
          onNoteUp={releaseNote}
        />
      </section>

      {kChainConfig.plugins.map((plugin) => (
        <section key={plugin.id} className="plugin-panel">
          <h2>{plugin.name}</h2>
          <div
            className="iframe-wrap"
            ref={(element) => {
              panelRefs.current[plugin.id] = element
            }}
          />
        </section>
      ))}
    </main>
  )
}

export default App
