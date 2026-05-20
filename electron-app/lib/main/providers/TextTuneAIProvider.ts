import type { Provider } from './Provider'
import type { WorkingMode } from '@/lib/main/types'
import type { NotificationService, LogService, BroadcastService } from '@/lib/main/services'
import type { ModelDownloader } from '@/lib/main/providers/helpers/ModelDownloader'
import { LocalInferenceEngine } from './tt-ai/LocalInferenceEngine'
import { RemoteInferenceClient } from './tt-ai/RemoteInferenceClient'

export class TextTuneAIProvider implements Provider {
  readonly id: WorkingMode = 'tt-ai'

  private localEngine: LocalInferenceEngine
  private remoteClient: RemoteInferenceClient

  constructor(
    private modelGetter: () => string | null,
    private textTuneServerUrlGetter: () => string | null,
    modelDownloader: ModelDownloader,
    notificationService: NotificationService,
    logService: LogService,
    private broadcastService: BroadcastService
  ) {
    this.localEngine = new LocalInferenceEngine(modelDownloader, notificationService, logService)
    this.remoteClient = new RemoteInferenceClient(notificationService, logService)
  }

  async ensureReady(): Promise<void> {
    const model = this.modelGetter()
    if (!model) {
      this.broadcastService.focusModelSelector()
      throw new Error('No Text Tune model selected')
    }

    if (model === 'Text-Tune-Small') {
      if (!this.localEngine.isReady()) {
        await this.localEngine.ensureReady()
      }
      return
    }

    if (model === 'Text-Tune-Base-v13') {
      const url = this.textTuneServerUrlGetter()
      if (!url) {
        this.broadcastService.focusTextTuneUrlInput()
        throw new Error('No Text Tune server URL configured')
      }
      return
    }
  }

  async fix(text: string): Promise<string> {
    const model = this.modelGetter()
    if (!model) throw new Error('No Text Tune model selected')

    if (model === 'Text-Tune-Small') {
      return this.localEngine.fix(text)
    }

    if (model === 'Text-Tune-Base-v13') {
      const url = this.textTuneServerUrlGetter()
      if (!url) throw new Error('No Text Tune server URL configured')
      return this.remoteClient.fix(text, model, url)
    }

    throw new Error(`Unknown model: ${model}`)
  }

  getModel(): string | null {
    return this.modelGetter()
  }
}
