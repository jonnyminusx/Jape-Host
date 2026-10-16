import type { ChainPluginConfig } from '../config/chain'
import type { ClapNode } from './runtime'
import { WclapRuntime } from './runtime'

type PluginHandle = {
  config: ChainPluginConfig
  node: ClapNode
  openPanel: () => Promise<HTMLIFrameElement | null>
}

export type BuiltChain = {
  plugins: PluginHandle[]
  midiTarget: ClapNode
  output: AudioNode
  dispose: () => void
}

function validatePlugins(plugins: ChainPluginConfig[]) {
  const instruments = plugins.filter((plugin) => plugin.role === 'instrument')
  if (instruments.length !== 1) {
    throw new Error('Chain must contain exactly one instrument plugin.')
  }

  let instrumentSeen = false
  for (const plugin of plugins) {
    if (plugin.role === 'instrument') {
      instrumentSeen = true
    }
    if (plugin.role === 'audio-fx' && !instrumentSeen) {
      throw new Error('Audio FX must come after the instrument.')
    }
  }
}

export async function buildChain(
  runtime: WclapRuntime,
  audioContext: AudioContext,
  config: { plugins: ChainPluginConfig[] },
): Promise<BuiltChain> {
  validatePlugins(config.plugins)

  const pluginHandles: PluginHandle[] = []
  for (const plugin of config.plugins) {
    const node = await runtime.createPluginNode(
      audioContext,
      plugin.moduleUrl,
      plugin.pluginId,
    )
    pluginHandles.push({
      config: plugin,
      node,
      openPanel: () => runtime.openPanel(node),
    })
  }

  for (let index = 1; index < pluginHandles.length; index += 1) {
    const previous = pluginHandles[index - 1].node
    const current = pluginHandles[index].node
    previous.connect(current)
    await previous.connectEvents(current)
  }

  const midiTarget = pluginHandles[0]?.node
  const output = pluginHandles[pluginHandles.length - 1]?.node
  if (!midiTarget || !output) {
    throw new Error('No plugins configured.')
  }

  return {
    plugins: pluginHandles,
    midiTarget,
    output,
    dispose: () => {
      for (const plugin of pluginHandles) {
        plugin.node.disconnect()
        plugin.node.closeInterface?.()
      }
    },
  }
}
