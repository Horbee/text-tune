import type { HistoryItem, WorkingMode } from '@/lib/main/types'
import { Provider } from '../providers/Provider'

export interface FixResult {
  original: string
  fixed: string
  history: HistoryItem[]
}

export class FixService {
  private providers: Map<WorkingMode, Provider> = new Map()
  private activeMode: WorkingMode
  private history: HistoryItem[] = []

  constructor(initialMode: WorkingMode) {
    this.activeMode = initialMode
  }

  registerProvider(provider: Provider) {
    this.providers.set(provider.id, provider)
  }

  setMode(mode: WorkingMode) {
    this.activeMode = mode
  }

  getMode() {
    return this.activeMode
  }

  getHistory() {
    return this.history
  }

  async fix(text: string): Promise<FixResult> {
    const provider = this.providers.get(this.activeMode)
    if (!provider) throw new Error(`No provider registered for mode ${this.activeMode}`)
    await provider.ensureReady()
    const fixed = await provider.fix(text)

    this.history.push({ id: this.history.length + 1, type: 'original', text })
    this.history.push({ id: this.history.length + 1, type: 'fix', text: fixed, usedProvider: this.activeMode })

    return { original: text, fixed, history: this.history }
  }
}
