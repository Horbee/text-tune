import { Injectable } from '@nestjs/common'
import { Ollama } from 'ollama'
import { PrismaService } from '@/db/prisma.service'

export enum ModelName {
  TextTuneSmall = 'Text-Tune-Small-v6',
  TextTuneBase = 'Text-Tune-Base-v6',
  TextTuneLarge = 'Text-Tune-Large-v6',
}

@Injectable()
export class LlmService {
  private ollama: Ollama
  private host = process.env.OLLAMA_HOST || 'http://localhost:11435'

  constructor(private prisma: PrismaService) {
    this.ollama = new Ollama({ host: this.host })
  }

  formatPromptTemplate(text: string): string {
    const inst =
      'Korrigiere die Grammatik im folgenden Text, aber behalte den ursprünglichen Stil und Ton bei. Verleihe dem Text keine formelle Note, wenn er diese nicht hat. Gib **nur** den korrigierten Satz zurück, ohne Anmerkungen. Wenn der Satz korrekt ist, gib ihn unverändert zurück.'

    return `<s>[INST]${inst}\n\n${text}[/INST]`
  }

  async generateCorrection(text: string, model: ModelName): Promise<{ response: string }> {
    const result = await this.ollama.generate({
      model,
      prompt: text, // Ollama handles the prompt formatting internally
      stream: false,
    })

    await this.prisma.correction.create({
      data: {
        original: text,
        corrected: result.response,
        prompt: this.formatPromptTemplate(text),
        modelName: model,
      },
    })

    return result
  }
}
