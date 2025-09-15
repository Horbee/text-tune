import { ipcRenderer } from 'electron'

import type { BackendState } from '@/lib/main/types'
import type { ErrorPayload, FixSuccessPayload, IPCChannel } from '@/lib/main/ipc/channels'
import { IPC_CHANNELS } from '@/lib/main/ipc/channels'

interface InvokeInterface {
  (channel: 'save-deepl-api-key', apiKey: string): Promise<void>
  (channel: 'delete-deepl-api-key'): Promise<void>
  (channel: 'check-deepl-api-key'): Promise<boolean>
  (channel: 'save-openai-api-key', apiKey: string): Promise<void>
  (channel: 'delete-openai-api-key'): Promise<void>
  (channel: 'check-openai-api-key'): Promise<boolean>
  (channel: 'get-backend-state'): Promise<BackendState>
  (channel: 'set-backend-state', state: Partial<BackendState>): Promise<void>
}

interface ReceiveInterface {
  (channel: typeof IPC_CHANNELS.fixSuccess, callback: (args: FixSuccessPayload) => void): Function
  (channel: typeof IPC_CHANNELS.error, callback: (args: ErrorPayload) => void): Function
  (channel: typeof IPC_CHANNELS.focusApiKeyInput, callback: () => void): Function
  (channel: typeof IPC_CHANNELS.focusModelSelector, callback: () => void): Function
}

const api = {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: IPCChannel, callback: (...args: any[]) => void) => {
    // For security reasons it is better not to send the entire event object
    const _func = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(...args)

    ipcRenderer.on(channel, _func)

    // Return unsubscribe function
    return () => ipcRenderer.removeListener(channel, _func)
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: IPCChannel) => {
    ipcRenderer.removeAllListeners(channel)
  },
} as {
  send: (channel: string, ...args: any[]) => void
  receive: ReceiveInterface
  invoke: InvokeInterface
  removeAllListeners: (channel: IPCChannel) => void
}

export default api
