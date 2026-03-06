import type { HistoryItem, WorkingMode } from '@/lib/main/types'
import { Provider } from '../providers/Provider'
import { BroadcastService } from './BroadcastService'

export interface FixResult {
  original: string
  fixed: string
}

export class FixService {
  private providers: Map<WorkingMode, Provider> = new Map()
  private activeMode: WorkingMode
  private history: HistoryItem[] = []

  constructor(
    initialMode: WorkingMode,
    private broadcastService: BroadcastService
  ) {
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
    const model = provider.getModel() || 'default'

    const historyId = this.addHistoryItem({ originalText: text, model, usedProvider: this.activeMode, isFixing: true })

    const fixed = await provider.fix(text)

    this.updateHistoryItem(historyId, fixed, false)

    return { original: text, fixed }
  }

  private addHistoryItem(item: Omit<HistoryItem, 'id'>): number {
    const newItem = {
      id: this.history.length + 1,
      ...item,
    }
    this.history.push(newItem)

    this.broadcastService.fixSuccess({ historyState: this.history })

    return newItem.id
  }

  private updateHistoryItem(id: number, fixedText: string, isFixing: boolean = false) {
    const item = this.history.find((h) => h.id === id)
    if (item) {
      item.fixedText = fixedText
      item.isFixing = isFixing
      this.broadcastService.fixSuccess({ historyState: this.history })
    } else {
      throw new Error(`History item with id ${id} not found`)
    }
  }
}
