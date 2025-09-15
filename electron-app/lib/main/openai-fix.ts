import OpenAI from 'openai'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { Notification } from 'electron'
import { createOrShowWindow } from './app'
import type { FixTextFn } from '@/lib/main/types'

const TextSchema = z.object({
  correctedText: z.string(),
})

export const fixTextFactory = (model: string, apiKey: string) => {
  const client = new OpenAI({
    apiKey: apiKey,
  })

  const fixText: FixTextFn = async (text) => {
    console.log('fixing text with ChatGPT')

    try {
      const response = await client.responses.parse({
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
      console.error('Error fixing text with Ollama:', error)

      // TODO: refactor notification to use NotificationService
      new Notification({
        title: 'Text Tune',
        body: error.message || 'An error occurred while fixing the text.',
      })
        .on('click', () => {
          createOrShowWindow()
        })
        .show()

      return 'An error occurred while fixing the text.'
    }
  }

  return fixText
}
