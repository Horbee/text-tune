import type { HistoryItem } from '../types'

export const IPC_CHANNELS = {
  fixSuccess: 'fix-success',
  error: 'error',
  focusApiKeyInput: 'focus-api-key-input',
  focusModelSelector: 'focus-model-selector',
  modelDownloadProgress: 'model-download-progress',
} as const

export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]

export const IPC_INVOKE_CHANNELS = {
  getOllamaModels: 'get-ollama-models',
} as const

export type IPCInvokeChannel = (typeof IPC_INVOKE_CHANNELS)[keyof typeof IPC_INVOKE_CHANNELS]

export interface GetOllamaModelsPayload {
  models: string[]
}

export interface FixSuccessPayload {
  historyState: HistoryItem[]
}

export interface ErrorPayload {
  title: string
  message: string
}

export interface ModelDownloadProgressPayload {
  percentage: number
}
