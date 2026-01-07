import { Injectable } from '@nestjs/common'
import { Ollama } from 'ollama'
import { PrismaService } from '@/db/prisma.service'

@Injectable()
export class LlmService {
  private ollama: Ollama
  private modelName = 'ministral-3-3b-gec'
  private host = process.env.OLLAMA_HOST || 'http://localhost:11435'

  constructor(private prisma: PrismaService) {
    this.ollama = new Ollama({ host: this.host })
  }

  formatPromptTemplate(text: string): string {
    const inst =
      'Korrigiere die Grammatik im folgenden Satz auf Standarddeutsch. Gib **nur** den korrigierten Satz zurück, ohne Anmerkungen.'

    return `<s>[INST] ${inst}\n\n${text} [/INST] `
  }

  async generateCorrection(prompt: string) {
    const result = await this.ollama.generate({
      model: this.modelName,
      prompt: prompt, // Ollama handles the prompt formatting internally
      stream: false,
    })

    await this.prisma.correction.create({
      data: {
        original: prompt,
        corrected: result.response,
        prompt: this.formatPromptTemplate(prompt),
      },
    })

    return result
  }
}
