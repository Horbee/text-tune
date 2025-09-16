import OpenAI from 'openai'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService } from '@/lib/main/services'

const TextSchema = z.object({
  correctedText: z.string(),
})

export class OpenAIProvider implements Provider {
  readonly id: WorkingMode = 'chatgpt'
  private client: OpenAI | null = null

  constructor(
    private modelGetter: () => string | null,
    private keyGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService
  ) {}

  isReady(): boolean {
    return !!this.modelGetter() && !!this.keyGetter()
  }

  async ensureReady(): Promise<void> {
    const model = this.modelGetter()
    const key = this.keyGetter()
    if (!model) throw new Error('No OpenAI model selected')
    if (!key) throw new Error('No OpenAI API key configured')
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: key,
      })
    }
  }

  async fix(text: string): Promise<string> {
    if (!this.client) throw new Error('OpenAI provider not initialized')

    const model = this.modelGetter()
    if (!model) throw new Error('No OpenAI model selected')

    this.logService.info('[OpenAIProvider] Fixing text')

    try {
      const response = await this.client.responses.parse({
        model,
        input: [
          {
            role: 'developer',
            content:
              "Fix all typos, casing and punctuation in the user's text. Make it grammatically correct, while keeping the source language. Return only the corrected text, don't include a preamble.",
          },
          {
            role: 'user',
            content: text,
          },
        ],
        reasoning: { effort: 'minimal' },
        text: {
          format: zodTextFormat(TextSchema, 'correctedText'),
        },
      })

      return response.output_parsed?.correctedText || text
    } catch (error: any) {
      console.error('Error fixing text with OpenAI:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }
}
