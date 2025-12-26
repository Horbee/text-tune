import axios from 'axios'
import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService, BroadcastService } from '@/lib/main/services'

type TextTuneAIResponse = {
  corrected_sentence: string
  original_sentence: string
}

export class TextTuneAIProvider implements Provider {
  readonly id: WorkingMode = 'tt-ai'

  private textTuneServerUrl: string | null = null

  constructor(
    private textTuneServerUrlGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService,
    private broadcastService: BroadcastService
  ) {}

  async ensureReady(): Promise<void> {
    const url = this.textTuneServerUrlGetter()
    if (!url) {
      this.broadcastService.focusTextTuneUrlInput()
      throw new Error('No Text Tune server URL configured')
    }

    this.textTuneServerUrl = url
  }

  async fix(text: string): Promise<string> {
    this.logService.info('[TextTuneAIProvider] Fixing text')

    try {
      const gecUrl = `${this.textTuneServerUrl}/gec`
      const response = await axios.post<TextTuneAIResponse>(gecUrl, { text })
      return response.data.corrected_sentence
    } catch (error: any) {
      console.error('Error fixing text with TextTuneAI:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }
}
