import axios from 'axios'
import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService, BroadcastService } from '@/lib/main/services'

type TextTuneAIResponse = {
  corrected: string
  original: string
}

export class TextTuneAIProvider implements Provider {
  readonly id: WorkingMode = 'tt-ai'

  private textTuneServerUrl: string | null = null

  constructor(
    private modelGetter: () => string | null,
    private textTuneServerUrlGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService,
    private broadcastService: BroadcastService
  ) {}

  async ensureReady(): Promise<void> {
    const model = this.modelGetter()
    const url = this.textTuneServerUrlGetter()
    if (!url) {
      this.broadcastService.focusTextTuneUrlInput()
      throw new Error('No Text Tune server URL configured')
    }
    if (!model) {
      this.broadcastService.focusModelSelector()
      throw new Error('No Text Tune model selected')
    }

    this.textTuneServerUrl = url
  }

  async fix(text: string): Promise<string> {
    const model = this.modelGetter()
    if (!model) throw new Error('No Text Tune model selected')

    this.logService.info('[TextTuneAIProvider] Fixing text')

    try {
      const gecUrl = `${this.textTuneServerUrl}/api/generate-correction`
      const response = await axios.post<TextTuneAIResponse>(gecUrl, { text, model })
      return response.data.corrected
    } catch (error: any) {
      console.error('Error fixing text with TextTuneAI:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }

  getModel(): string | null {
    return this.modelGetter()
  }
}
