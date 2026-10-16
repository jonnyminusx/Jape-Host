#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
target="$root/public/plugins/synple.wclap.wasm"
mkdir -p "$(dirname "$target")"

if [[ -n "${SYNPLE_WASM_PATH:-}" && -f "${SYNPLE_WASM_PATH}" ]]; then
  cp "${SYNPLE_WASM_PATH}" "$target"
  echo "Copied Synple from SYNPLE_WASM_PATH."
  exit 0
fi

local_build="${HOME}/Code/GitHub/Synple-WebCLAP/build/synple.wclap.wasm"
if [[ -f "$local_build" ]]; then
  cp "$local_build" "$target"
  echo "Copied Synple from local Synple-WebCLAP build."
  exit 0
fi

release_url="${SYNPLE_RELEASE_URL:-https://github.com/jonnyminusx/Synple-WebCLAP/releases/latest/download/synple.wclap.wasm}"
if curl -fL "$release_url" -o "$target"; then
  echo "Downloaded Synple from release URL."
  exit 0
fi

fallback_url="${SYNPLE_FALLBACK_URL:-https://jonnyminusx.github.io/Synple-WebCLAP/examples/synple/synple.wclap.wasm}"
curl -fL "$fallback_url" -o "$target"
echo "Downloaded Synple from fallback URL."
