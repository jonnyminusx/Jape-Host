# Jape-Host

Browser host for WebCLAP plugins with a fixed, extensible linear chain:

`MIDI in -> [note-fx]* -> instrument -> [audio-fx]* -> audio out`

v1 hosts Synple only, but plugin order and roles are declared in [`chain.ts`](./src/config/chain.ts).

## Architecture

- [`runtime.ts`](./src/engine/runtime.ts): thin adapter over WebCLAP `clap-audionode`.
- [`chain.ts`](./src/engine/chain.ts): validates chain topology and wires audio/event routing.
- [`midi/`](./src/midi/): MIDI bus + sources (Web MIDI + computer keyboard + on-screen keyboard).
- Per-plugin CLAP webviews are shown in dedicated panels.

## Runtime fetch policy

This repo does **not** vendor the WebCLAP browser-test-host runtime.  
[`fetch-runtime.sh`](./scripts/fetch-runtime.sh) fetches it at a pinned commit and applies a tiny patch that adds a remote `sendEvents` API for main-thread MIDI injection.

## Local development

```bash
npm install
npm run prepare:all
npm run dev
```

`prepare:all`:
- fetches and patches the runtime into `public/runtime/`
- copies Synple WASM from `~/Code/GitHub/Synple-WebCLAP/build/synple.wclap.wasm`, or downloads the latest release asset if missing

You can override sources with:
- `SYNPLE_WASM_PATH=/path/to/synple.wclap.wasm`
- `SYNPLE_RELEASE_URL=https://.../synple.wclap.wasm`

## Deploy

GitHub Pages deploy is handled by [pages.yml](./.github/workflows/pages.yml).
