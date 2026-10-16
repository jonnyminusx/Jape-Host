export type PluginRole = 'note-fx' | 'instrument' | 'audio-fx'

export type ChainPluginConfig = {
  id: string
  name: string
  role: PluginRole
  moduleUrl: string
  pluginId?: string
}

export const kChainConfig: { plugins: ChainPluginConfig[] } = {
  plugins: [
    {
      id: 'synple',
      name: 'Synple',
      role: 'instrument',
      moduleUrl: '/plugins/synple.wclap.wasm',
    },
  ],
}
