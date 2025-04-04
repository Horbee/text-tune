import { ipcRenderer } from 'electron'

import type { BackendState, HistoryItem } from '@/lib/main/types'

interface InvokeInterface {
  (channel: 'check-api-key'): Promise<boolean>
  (channel: 'get-backend-state'): Promise<BackendState>
  (channel: 'set-backend-state', state: Partial<BackendState>): Promise<void>
  (channel: 'save-api-key', apiKey: string): Promise<void>
  (channel: 'delete-api-key'): Promise<void>
}
type ListenChannel = 'message-from-main'
interface ReceiveInterface {
  (channel: ListenChannel, func: (args: ErrorMessageInterface | FixSuccessInterface) => void): void
}

interface ErrorMessageInterface {
  type: 'ERROR'
  title: string
  message: string
}

interface FixSuccessInterface {
  type: 'FIX_SUCCESS'
  historyState: HistoryItem[]
}

const api = {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
} as {
  send: (channel: string, ...args: any[]) => void
  receive: ReceiveInterface
  invoke: InvokeInterface
  removeAllListeners: (channel: ListenChannel) => void
}

export default api
