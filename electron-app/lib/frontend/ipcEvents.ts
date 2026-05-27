import { ipcMain } from 'electron'
import fs from 'fs'
import { ConfigService, PingService } from '@/lib//main/services'
import type { FixService } from '@/lib/main/services'
import type { WorkingMode } from '@/lib/main/types'
import type { ModelDownloader } from '@/lib/main/providers/helpers/ModelDownloader'
import type { BroadcastService } from '@/lib/main/services/BroadcastService'

const handleIPC = (channel: string, handler: (...args: any[]) => void) => {
  ipcMain.handle(channel, handler)
}

export const registerFrontendIPC = (
  configService: ConfigService,
  fixService: FixService,
  pingService: PingService,
  modelDownloader: ModelDownloader,
  broadcastService: BroadcastService
) => {
  // DeepL Text Handlers
  handleIPC('save-deepl-api-key', (_e, deeplApiKey: string) => {
    try {
      configService.setDeepLApiKey(deeplApiKey)
    } catch (error) {
      throw error
    }
  })

  handleIPC('delete-deepl-api-key', async () => {
    try {
      configService.setDeepLApiKey(null)
    } catch (error) {
      throw error
    }
  })

  handleIPC('check-deepl-api-key', async () => {
    return !!configService.getDeepLApiKey()
  })

  // OpenAI API Key Handlers
  handleIPC('save-openai-api-key', (_e, openaiApiKey: string) => {
    try {
      configService.setOpenAIKey(openaiApiKey)
    } catch (error) {
      throw error
    }
  })

  handleIPC('delete-openai-api-key', async () => {
    try {
      configService.setOpenAIKey(null)
    } catch (error) {
      throw error
    }
  })

  handleIPC('check-openai-api-key', async () => {
    return !!configService.getOpenAIKey()
  })

  // Text Tune AI Handlers
  // Model Download Handlers
  handleIPC('check-model-downloaded', async () => {
    return modelDownloader.isDownloaded()
  })

  handleIPC('download-model', async () => {
    await modelDownloader.ensureExists((percentage) => {
      broadcastService.modelDownloadProgress(percentage)
    })
  })

  handleIPC('delete-model', async () => {
    const modelPath = modelDownloader.getModelPath()
    if (fs.existsSync(modelPath)) {
      fs.rmSync(modelPath, { force: true })
    }
  })

  handleIPC('get-backend-state', () => ({
    workingMode: configService.getWorkingMode(),
    ollamaModel: configService.getOllamaModel(),
    openAIModel: configService.getOpenAIModel(),
    textTuneModel: configService.getTextTuneModel(),
    translateHistory: fixService.getHistory(),
  }))

  handleIPC('set-working-mode', async (_e, mode: WorkingMode) => {
    configService.setWorkingMode(mode)
    fixService.setMode(mode)
  })

  handleIPC('set-ollama-model', async (_e, model: string | null) => {
    configService.setOllamaModel(model)
  })

  handleIPC('set-openai-model', async (_e, model: string | null) => {
    configService.setOpenAIModel(model)
  })

  handleIPC('set-text-tune-model', async (_e, model: string | null) => {
    configService.setTextTuneModel(model)
  })
}
