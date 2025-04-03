import type { TargetLanguageCode } from 'deepl-node'

export type BackendState = {
  workingMode: 'deepl' | 'ollama'
  ollamaModel: string | null
  translateHistory: HistoryItem[]
}

export type HistoryItem = {
  id: number
  type: 'original' | 'fix'
  text: string
}

export type FixTextFn = (text: string, targetLang?: TargetLanguageCode) => Promise<string>
