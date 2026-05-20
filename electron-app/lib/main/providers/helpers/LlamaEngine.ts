import { GbnfJsonObjectSchema, getLlama, LlamaCompletion, type LlamaModel } from 'node-llama-cpp'

export class LlamaEngine {
  private model: LlamaModel | null = null
  private grammar: any = null

  async initialize(modelPath: string, jsonSchema: Readonly<GbnfJsonObjectSchema>): Promise<void> {
    console.log('Initializing Llama engine...')
    const llama = await getLlama()

    this.model = await llama.loadModel({
      modelPath: modelPath,
    })

    this.grammar = await llama.createGrammarForJsonSchema(jsonSchema)
  }

  isReady(): boolean {
    return this.model !== null
  }

  getGrammar(): any {
    return this.grammar
  }

  async generateCompletion(
    prompt: string,
    options?: {
      temperature?: number
      contextSize?: number
      customStopTriggers?: string[]
      onTextChunk?: (chunk: string) => void
    }
  ): Promise<string> {
    if (!this.model) throw new Error('Llama engine not initialized')

    const context = await this.model.createContext({
      contextSize: options?.contextSize ?? 512,
    })

    const completion = new LlamaCompletion({ contextSequence: context.getSequence() })

    const response = await completion.generateCompletion(prompt, {
      grammar: this.grammar,
      temperature: options?.temperature ?? 0.1,
      customStopTriggers: options?.customStopTriggers ?? ['</s>', '[/INST]'],
      onTextChunk: options?.onTextChunk,
    })

    return response
  }
}
