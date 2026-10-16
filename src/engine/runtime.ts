type ClapNode = AudioNode & {
  descriptor: { id: string; name: string; features: string[] }
  connectEvents: (otherNode: ClapNode) => Promise<void>
  sendEvents: (events: Uint8Array[]) => Promise<void>
  getParams: () => Promise<Array<{ id: string; name: string }>>
  openInterface?: (options: {
    filePrefix: string
    resourcePrefix: string
  }) => HTMLIFrameElement
  closeInterface?: () => void
  getFile: (path: string) => Promise<ArrayBuffer | null>
  getResource: (path: string) => Promise<Blob | null>
}

type ClapModule = {
  createNode: (
    audioContext: AudioContext,
    pluginId: string | null,
    nodeOptions: {
      numberOfInputs: number
      numberOfOutputs: number
      outputChannelCount: number[]
    },
  ) => Promise<ClapNode>
}

declare global {
  interface Window {
    pageProxyReady: Promise<{ prefix: string; symbol: symbol }>
  }
}

export class WclapRuntime {
  async createPluginNode(
    audioContext: AudioContext,
    moduleUrl: string,
    pluginId?: string,
  ): Promise<ClapNode> {
    const runtimeModulePath = new URL(
      `${import.meta.env.BASE_URL}runtime/clap-audionode/clap-audionode.mjs`,
      window.location.href,
    ).href
    const imported = await import(/* @vite-ignore */ runtimeModulePath)
    const ClapAudioNode = imported.default as new (options: {
      url: string
    }) => ClapModule
    const module = new ClapAudioNode({ url: moduleUrl })
    return module.createNode(audioContext, pluginId ?? null, {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })
  }

  async openPanel(node: ClapNode): Promise<HTMLIFrameElement | null> {
    if (!node.openInterface) {
      return null
    }
    const pageProxy = await window.pageProxyReady
    const frameId = `iframe-${crypto.randomUUID()}`
    const iframe = node.openInterface({
      filePrefix: `${pageProxy.prefix}${frameId}/file`,
      resourcePrefix: `${pageProxy.prefix}${frameId}/get_resource`,
    })
    ;(iframe as unknown as Record<symbol, (path: string) => Promise<unknown>>)[
      pageProxy.symbol
    ] = async (path: string) => {
      if (path.startsWith('/file/')) {
        return node.getFile(path.slice('/file/'.length))
      }
      if (path.startsWith('/get_resource/')) {
        return node.getResource(path.slice('/get_resource/'.length))
      }
      return null
    }
    iframe.style.width = '100%'
    iframe.style.height = '640px'
    iframe.style.border = '0'
    return iframe
  }
}

export type { ClapNode }
