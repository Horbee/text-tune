import { create } from 'zustand'
import { showErrorNotification } from '../App'

import type { HistoryItem } from '@/lib/main/types'

type Store = {
  deeplApiKeySaved: boolean
  ollamaModelSelected: boolean
  workingMode: 'deepl' | 'ollama'
  setWorkingMode: (mode: 'deepl' | 'ollama') => Promise<void>
  selectedOllamaModel: string | null
  setSelectedOllamaModel: (model: string | null) => Promise<void>
  fixHistory: HistoryItem[]
  initStore: () => Promise<void>
  saveDeeplApiKey: (apiKey: string) => Promise<void>
  deleteDeeplApiKey: () => Promise<void>
  setupListeners: () => void
  cleanupListeners: () => void
}

export const useFrontendStore = create<Store>()((set) => ({
  deeplApiKeySaved: false,
  ollamaModelSelected: false,
  workingMode: 'deepl',
  selectedOllamaModel: null,
  fixHistory: [],

  initStore: async () => {
    const deeplApiKeySaved = await window.api.invoke('check-api-key')
    const backendState = await window.api.invoke('get-backend-state')

    console.log(backendState)

    set({
      deeplApiKeySaved,
      workingMode: backendState.workingMode,
      ollamaModelSelected: !!backendState.ollamaModel,
      selectedOllamaModel: backendState.ollamaModel,
      fixHistory: backendState.translateHistory,
    })
  },

  setSelectedOllamaModel: async (model) => {
    try {
      await window.api.invoke('set-backend-state', { ollamaModel: model })
      set({ selectedOllamaModel: model, ollamaModelSelected: !!model })
    } catch (error) {
      showErrorNotification('Ollama model was not set!', 'Please try again.')
    }
  },
  setWorkingMode: async (mode) => {
    console.log(mode)
    try {
      await window.api.invoke('set-backend-state', { workingMode: mode })
      set({ workingMode: mode })
    } catch (error) {
      showErrorNotification('Working mode was not set!', 'Please try again.')
    }
  },
  saveDeeplApiKey: async (apiKey: string) => {
    try {
      await window.api.invoke('save-api-key', apiKey)
      set({ deeplApiKeySaved: true })
    } catch (error) {
      showErrorNotification('Api Key was not saved!', 'Please try again.')
      set({ deeplApiKeySaved: false })
    }
  },
  deleteDeeplApiKey: async () => {
    try {
      await window.api.invoke('delete-api-key')
      set({ deeplApiKeySaved: false })
    } catch (error) {
      showErrorNotification('Api Key was not deleted!', 'Please try again.')
    }
  },
  setupListeners: () => {
    window.api.receive('message-from-main', ({ type, title, message, historyState }) => {
      if (type === 'ERROR') {
        showErrorNotification(title, message)
      }
      if (type === 'FIX_SUCCESS') {
        set({ fixHistory: historyState })
      }
    })
  },
  cleanupListeners: () => {
    window.api.removeAllListeners('message-from-main')
  },
}))
