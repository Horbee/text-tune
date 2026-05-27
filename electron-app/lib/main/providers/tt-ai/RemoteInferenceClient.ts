import axios from 'axios'
import type { NotificationService, LogService } from '@/lib/main/services'

type TextTuneAIResponse = {
  corrected: string
  original: string
}

export class RemoteInferenceClient {
  constructor(
    private notificationService: NotificationService,
    private logService: LogService
  ) {}

  async fix(text: string, model: string, serverUrl: string, token?: string): Promise<string> {
    this.logService.info('[RemoteInferenceClient] Fixing text')

    try {
      const gecUrl = `${serverUrl}/api/generate-correction`
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      const response = await axios.post<TextTuneAIResponse>(gecUrl, { text, model }, { headers })
      return response.data.corrected
    } catch (error: any) {
      console.error('Error fixing text with RemoteInferenceClient:', error)
      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')
      return 'An error occurred while fixing the text.'
    }
  }
}
