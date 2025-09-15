import type { HistoryItem } from '../types'

export const IPC_CHANNELS = {
  fixSuccess: 'fix-success',
  error: 'error',
  focusApiKeyInput: 'focus-api-key-input',
  focusModelSelector: 'focus-model-selector',
} as const

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export interface FixSuccessPayload {
  historyState: HistoryItem[]
}

export interface ErrorPayload {
  title: string
  message: string
}
