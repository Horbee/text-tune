import type { TargetLanguageCode } from 'deepl-node'

export type WorkingMode = 'deepl' | 'ollama' | 'chatgpt'

export type BackendState = {
  workingMode: WorkingMode
  ollamaModel: string | null
  openAIModel: string | null
  translateHistory: HistoryItem[]
}

export type HistoryItem = {
  id: number
  type: 'original' | 'fix'
  text: string
  usedProvider?: WorkingMode
}

export type FixTextFn = (text: string, targetLang?: TargetLanguageCode) => Promise<string>
