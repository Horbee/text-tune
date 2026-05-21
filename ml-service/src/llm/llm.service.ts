import { Injectable } from '@nestjs/common'
import { Ollama } from 'ollama'
import { PrismaService } from '@/lib/prisma.service'
import { z } from 'zod'

export enum ModelName {
  TextTuneBase = 'Text-Tune-Base-v13',
}

const ResponseSchema = z.object({
  corrected_text: z.string(),
})

@Injectable()
export class LlmService {
  private ollama: Ollama
  private host = process.env.OLLAMA_HOST || 'http://localhost:11435'

  constructor(private prisma: PrismaService) {
    this.ollama = new Ollama({ host: this.host })
  }

  formatPromptTemplate(text: string): string {
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

    return `<s>[INST]${INSTRUCTION_V6.replace('{input_text}', text)}[/INST]`
  }

  async generateCorrection(text: string, model: ModelName): Promise<string> {
    const result = await this.ollama.generate({
      model,
      prompt: text, // Ollama handles the prompt formatting internally
      stream: false,
      format: z.toJSONSchema(ResponseSchema),
    })

    const parsed = ResponseSchema.parse(JSON.parse(result.response))

    await this.prisma.correction.create({
      data: {
        original: text,
        corrected: parsed.corrected_text,
        prompt: this.formatPromptTemplate(text),
        modelName: model,
      },
    })

    return parsed.corrected_text
  }
}
