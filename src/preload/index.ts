import { contextBridge, ipcRenderer } from 'electron'

// 타입 안전한 IPC 채널 정의
export type IpcChannels = {
  // Main -> Renderer
  'app:message': (message: string) => void
  'crawler-log': (log: string) => void
  'crawler-status': (status: string) => void
  // Renderer -> Main (invoke)
  'app:getVersion': () => Promise<string>
  'start-crawling': (params: {
    hashtag: string
    tweetCount: number
  }) => Promise<{ success: boolean; message: string }>
  // Renderer -> Main (send)
  'app:log': (level: string, message: string) => void
}

// Renderer에 노출할 API
const electronAPI = {
  // Invoke (양방향 통신)
  invoke: <K extends keyof IpcChannels>(
    channel: K,
    ...args: Parameters<IpcChannels[K]>
  ): ReturnType<IpcChannels[K]> extends Promise<infer R> ? Promise<R> : Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args) as ReturnType<IpcChannels[K]> extends Promise<infer R>
      ? Promise<R>
      : Promise<unknown>,

  // Send (단방향 통신)
  send: <K extends keyof IpcChannels>(channel: K, ...args: Parameters<IpcChannels[K]>): void =>
    ipcRenderer.send(channel, ...args),

  // On (메인에서 수신)
  on: <K extends keyof IpcChannels>(
    channel: K,
    callback: (...args: Parameters<IpcChannels[K]>) => void
  ): (() => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void =>
      callback(...(args as Parameters<IpcChannels[K]>))
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  },
}

// Context Bridge로 노출
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error - window.electron은 preload에서 정의
  window.electron = electronAPI
}

export type ElectronAPI = typeof electronAPI
