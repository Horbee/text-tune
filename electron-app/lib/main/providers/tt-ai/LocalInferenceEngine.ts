import type { NotificationService, LogService } from '@/lib/main/services'
import type { ModelDownloader } from '@/lib/main/providers/helpers/ModelDownloader'
import { LlamaEngine } from '@/lib/main/providers/helpers/LlamaEngine'

const INSTRUCTION_V6 = `Du bist ein strenger und hochpräziser Korrektor für deutsche Grammatik. Deine einzige Aufgabe ist es, Grammatik-, Rechtschreib- und Zeichensetzungsfehler im bereitgestellten Text zu beheben und das Ergebnis als valides JSON zurückzugeben.
   
STRIKTE REGELN:
1. JSON-FORMAT: Die Antwort muss ein gültiges JSON-Objekt sein, das exakt einen Key enthält: "corrected_text".
2. MINIMALE ÄNDERUNGEN: Verändere niemals den ursprünglichen Stil, Ton oder das Vokabular. Mach den Text nicht formeller, als er ist. Nutze keine **Markdown-Formatierungen** und füge keine zusätzlichen Erklärungen hinzu.
3. KEIN CHAT & KEINE CODEBLÖCKE: Gib AUSSCHLIESSLICH das JSON-Objekt zurück. Füge keinen Text vor oder nach dem JSON hinzu. Verwende KEINE Markdown-Formatierungen (wie \`\`\`json ... \`\`\`).
4. KEINE ÜBERKORREKTUR: Wenn der Satz korrekt ist, gib ihn unverändert im JSON zurück.
 
BEISPIELE:
 
Input: "ich gehe heute in den stadt weil ich einkaufen muss"
Output: {"corrected_text": "Ich gehe heute in die Stadt, weil ich einkaufen muss."}
 
Input: "Das is mir echt voll egal was die anderen sagen."
Output: {"corrected_text": "Das ist mir echt voll egal, was die anderen sagen."}
 
Input: "Wir standen nur da und schauten einander überrascht an."
Output: {"corrected_text": "Wir standen nur da und schauten einander überrascht an."}
 
TEXT ZUR KORREKTUR:
{input_text}
Output:
`

const GRAMMAR_SCHEMA = {
  type: 'object' as const,
  properties: {
    corrected_text: { type: 'string' as const },
  },
}

export class LocalInferenceEngine {
  private llamaEngine: LlamaEngine

  constructor(
    private modelDownloader: ModelDownloader,
    private notificationService: NotificationService,
    private logService: LogService
  ) {
    this.llamaEngine = new LlamaEngine()
  }

  isReady(): boolean {
    return this.llamaEngine.isReady()
  }

  async ensureReady(onProgress?: (percentage: number) => void): Promise<void> {
    if (this.llamaEngine.isReady()) return

    const modelPath = await this.modelDownloader.ensureExists(onProgress)
    await this.llamaEngine.initialize(modelPath, GRAMMAR_SCHEMA)
  }

  async fix(text: string): Promise<string> {
    this.logService.info('[LocalInferenceEngine] Fixing text')

    try {
      const prompt = `<s>[INST]${INSTRUCTION_V6.replace('{input_text}', text)}[/INST]`
      const response = await this.llamaEngine.generateCompletion(prompt)
      const parsedRes = this.llamaEngine.getGrammar().parse(response)
      return parsedRes.corrected_text
    } catch (error: any) {
      console.error('Error fixing text with LocalInferenceEngine:', error)
      this.notificationService.showError('Text Tune', error.message || 'An error occurred while fixing the text.')
      return 'An error occurred while fixing the text.'
    }
  }
}
