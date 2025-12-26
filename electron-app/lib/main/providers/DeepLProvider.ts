import { Translator, TargetLanguageCode } from 'deepl-node'

import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService, BroadcastService } from '@/lib/main/services'

export class DeepLProvider implements Provider {
  readonly id: WorkingMode = 'deepl'
  private translator: Translator | null = null

  constructor(
    private apiKeyGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService,
    private broadcastService: BroadcastService
  ) {}

  async ensureReady(): Promise<void> {
    const key = this.apiKeyGetter()
    if (!key) {
      this.broadcastService.focusApiKeyInput()
      throw new Error('No DeepL API key configured')
    }
    if (!this.translator) {
      this.translator = new Translator(key)
    }
  }

  async fix(text: string): Promise<string> {
    if (!this.translator) throw new Error('DeepL provider not initialized')

    this.logService.info('[DeepLProvider] Fixing text')

    const targetLang = 'de' as TargetLanguageCode
    const langs = (['en-US', 'de'] as TargetLanguageCode[]).filter((lang) => lang !== targetLang)
    langs.push(targetLang)

    try {
      let fixedText = text
      for (const lang of langs) {
        const result = await this.translator.translateText(fixedText, null, lang)
        fixedText = result.text
      }

      return fixedText
    } catch (error: any) {
      console.error('Error fixing text with DeepL:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }
}
