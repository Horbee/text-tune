import OpenAI from 'openai'
import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService, BroadcastService } from '@/lib/main/services'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const OLLAMA_ENDPOINT = 'http://localhost:11434/v1'

const CorrectionsResponse = z.object({
  corrected_text: z.string(),
})

const getPromptTemplate = (text: string) => {
  return `You are a strict and highly precise multilingual proofreader. Your only task is to correct grammar, spelling, punctuation, capitalization, and clear typographical errors in the provided text and return the result as valid JSON.

First, automatically identify the language or languages used in the input text. Apply the appropriate grammar, spelling, capitalization, and punctuation rules for each detected language.

STRICT RULES:

1. JSON FORMAT
   Return a valid JSON object containing exactly one key:

"corrected_text"

2. MINIMAL CHANGES
   Make only the changes necessary to correct objective grammar, spelling, punctuation, capitalization, and typographical errors.

Do not:

* rewrite sentences unnecessarily;
* change the original meaning;
* alter the author's style, tone, register, or vocabulary;
* make informal text more formal;
* replace valid regional or stylistic expressions merely because another formulation sounds more natural;
* translate the text.

3. LANGUAGE PRESERVATION
   Preserve the original language of the text.

For multilingual or code-switched text:

* retain all languages used in the input;
* correct each part according to the rules of its respective language;
* do not translate words or passages from one language into another;
* preserve proper names, product names, technical terms, abbreviations, URLs, email addresses, placeholders, and code unless they contain an obvious typographical error.

4. NO OVERCORRECTION
   If the input text is already correct, return it unchanged.

Do not change wording solely to improve fluency, elegance, clarity, or naturalness when the original wording is grammatically acceptable.

5. NO CHAT, EXPLANATIONS, OR MARKDOWN
   Return only the JSON object.

Do not include:

* explanations;
* comments;
* introductions;
* Markdown;
* code fences;
* additional JSON keys;
* text before or after the JSON object.

6. VALID JSON ESCAPING
   Ensure that the output is valid JSON. Escape quotation marks, backslashes, line breaks, and other special characters correctly when necessary.

EXAMPLES:

Input:
ich gehe heute in den stadt weil ich einkaufen muss

Output:
{"corrected_text":"Ich gehe heute in die Stadt, weil ich einkaufen muss."}

Input:
Das is mir echt voll egal was die anderen sagen.

Output:
{"corrected_text":"Das ist mir echt voll egal, was die anderen sagen."}

Input:
Wir standen nur da und schauten einander überrascht an.

Output:
{"corrected_text":"Wir standen nur da und schauten einander überrascht an."}

Input:
I dont know why she didnt answered me yesterday.

Output:
{"corrected_text":"I don't know why she didn't answer me yesterday."}

Input:
The meeting starts at 10 am, aber ich komme wahrscheinlich ein bisschen später.

Output:
{"corrected_text":"The meeting starts at 10 a.m., aber ich komme wahrscheinlich ein bisschen später."}

Input:
Kannst du mir bitte das deployment script schicken? I need it for tomorrows release.

Output:
{"corrected_text":"Kannst du mir bitte das Deployment-Skript schicken? I need it for tomorrow's release."}

TEXT TO CORRECT:
${text}

Output:
`
}
export class OllamaProvider implements Provider {
  readonly id: WorkingMode = 'ollama'
  private client: OpenAI

  constructor(
    private modelGetter: () => string | null,
    private notificationService: NotificationService,
    private logService: LogService,
    private broadcastService: BroadcastService
  ) {
    this.client = new OpenAI({
      baseURL: OLLAMA_ENDPOINT,
      apiKey: 'dummy',
    })
  }

  async ensureReady(): Promise<void> {
    const model = this.modelGetter()
    if (!model) {
      this.broadcastService.focusModelSelector()
      throw new Error('No Ollama model selected')
    }
  }

  async fix(text: string): Promise<string> {
    const model = this.modelGetter()
    if (!model) throw new Error('No Ollama model selected')

    this.logService.info('[OllamaProvider] Fixing text')

    try {
      const response = await this.client.chat.completions.parse({
        model,
        messages: [{ role: 'system', content: getPromptTemplate(text) }],
        stream: false,
        response_format: {
          json_schema: zodTextFormat(CorrectionsResponse, 'corrected_text'),
          type: 'json_schema',
        },
        think: false,
      })

      return (
        CorrectionsResponse.parse(response?.choices[0].message.parsed).corrected_text.trim() ||
        'An error occurred while fixing the text.'
      )

      // const response = await axios.post(
      //   `${OLLAMA_ENDPOINT}/api/generate`,
      //   {
      //     model,
      //     prompt: getPromptTemplate(text),
      //     keep_alive: '5m',
      //     stream: false,
      //   },
      //   {
      //     headers: { 'Content-Type': 'application/json' },
      //   }
      // )
      // return response.data.response.trim()
    } catch (error: any) {
      console.error('Error fixing text with Ollama:', error)

      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')

      return 'An error occurred while fixing the text.'
    }
  }

  getModel(): string | null {
    return this.modelGetter()
  }
}
