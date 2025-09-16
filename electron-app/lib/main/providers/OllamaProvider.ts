import axios from 'axios'
import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService } from '@/lib/main/services'

const OLLAMA_ENDPOINT = 'http://localhost:11434'

const getPromptTemplate = (text: string) => {
  return `Fix all typos and casing and punctuation in this text and make it grammatically correct, but keep the source language:

  ${text}

  Return only the corrected text, don't include a preamble.
  `
}

export class OllamaProvider implements Provider {
  readonly id: WorkingMode = 'ollama'

  constructor(
    private modelGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService
  ) {}

  isReady(): boolean {
    return !!this.modelGetter()
  }

  async ensureReady(): Promise<void> {
    const model = this.modelGetter()
    if (!model) throw new Error('No Ollama model selected')
  }

  async fix(text: string): Promise<string> {
    const model = this.modelGetter()
    if (!model) throw new Error('No Ollama model selected')

    this.logService.info('[OllamaProvider] Fixing text')

    try {
      const response = await axios.post(
        `${OLLAMA_ENDPOINT}/api/generate`,
        {
          model,
          prompt: getPromptTemplate(text),
          keep_alive: '5m',
          stream: false,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
      return response.data.response.trim()
    } catch (error: any) {
      console.error('Error fixing text with Ollama:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }
}
