#!/usr/bin/env bash
set -euo pipefail

host_repo="${WCLAP_HOST_REPO:-https://github.com/WebCLAP/browser-test-host.git}"
host_sha="${WCLAP_HOST_SHA:-b42ade615bef2c989f96400a7b0b2ef15cabd396}"

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

git clone --quiet "$host_repo" "$work/host"
git -C "$work/host" checkout --quiet "$host_sha"
git -C "$work/host" submodule update --init --recursive --depth 1 --quiet

rm -rf "$root/public/runtime"
mkdir -p "$root/public/runtime"
cp -R "$work/host/clap-audionode" "$root/public/runtime/"
cp "$work/host/page-proxy-service-worker.js" "$root/public/"

python3 - <<'PY'
from pathlib import Path

path = Path("public/runtime/clap-audionode/clap-audioworkletprocessor.mjs")
text = path.read_text()
marker = "disconnectEvents(otherId) {\n\t\t\tif (otherId == null) {\n\t\t\t\tthis.eventTargets = {};\n\t\t\t}\n\t\t},\n"
if "sendEvents(eventByteArrays)" not in text:
    text = text.replace(
        marker,
        marker
        + "\t\tsendEvents(eventByteArrays) {\n"
        + "\t\t\tfor (const eventBytes of eventByteArrays) {\n"
        + "\t\t\t\tglobalThis.clapRouting[this.routingId].events.push(new Uint8Array(eventBytes));\n"
        + "\t\t\t}\n"
        + "\t\t},\n",
    )
path.write_text(text)
PY

echo "Fetched runtime to public/runtime"
