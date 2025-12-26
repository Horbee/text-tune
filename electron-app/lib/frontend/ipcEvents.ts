import { ipcMain } from 'electron'
import { ConfigService, PingService } from '@/lib//main/services'
import type { FixService } from '@/lib/main/services'
import type { WorkingMode } from '@/lib/main/types'

const handleIPC = (channel: string, handler: (...args: any[]) => void) => {
  ipcMain.handle(channel, handler)
}

export const registerFrontendIPC = (configService: ConfigService, fixService: FixService, pingService: PingService) => {
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
  handleIPC('save-text-tune-server-url', async (_e, textTuneServerUrl: string) => {
    try {
      await pingService.ping<{ message: string }>(textTuneServerUrl) // Test the connection
      configService.setTextTuneServerUrl(textTuneServerUrl)
    } catch (error) {
      throw error
    }
  })

  handleIPC('delete-text-tune-server-url', async () => {
    try {
      configService.setTextTuneServerUrl(null)
    } catch (error) {
      throw error
    }
  })

  handleIPC('get-backend-state', () => ({
    workingMode: configService.getWorkingMode(),
    ollamaModel: configService.getOllamaModel(),
    openAIModel: configService.getOpenAIModel(),
    textTuneServerUrl: configService.getTextTuneServerUrl(),
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
}
