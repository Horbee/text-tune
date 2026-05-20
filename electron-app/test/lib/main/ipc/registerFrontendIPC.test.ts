import { describe, it, expect, vi } from 'vitest'
import { ipcMain, getIPCHandler, resetIPCHandlers } from 'electron'
import fs from 'fs'

import { resetFs } from '@/test/helpers/fs-store'
import { registerFrontendIPC } from '@/lib/frontend/ipcEvents'
import { ConfigService } from '@/lib/main/services'
import { FixService } from '@/lib/main/services/FixService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'
import type { PingService } from '@/lib/main/services/PingService'
import type { ModelDownloader } from '@/lib/main/providers/helpers/ModelDownloader'

describe('registerFrontendIPC', () => {
  function invoke(channel: string, ...args: any[]) {
    const handler = getIPCHandler(channel)
    if (!handler) throw new Error(`No handler registered for channel: ${channel}`)
    return handler({} as any, ...args)
  }

  function setup(overrides?: { pingFn?: () => Promise<any> }) {
    resetFs()
    resetIPCHandlers()
    vi.clearAllMocks()

    const configService = new ConfigService()
    const broadcastService = new BroadcastService()
    const fixService = new FixService('deepl', broadcastService)
    const pingService = { ping: vi.fn() } as unknown as PingService
    const modelDownloader = {
      getModelPath: vi.fn().mockReturnValue('/tmp/models/test.gguf'),
      isDownloaded: vi.fn().mockReturnValue(false),
      ensureExists: vi.fn().mockResolvedValue('/tmp/models/test.gguf'),
    } as unknown as ModelDownloader

    registerFrontendIPC(configService, fixService, pingService, modelDownloader, broadcastService)

    return { configService, fixService, pingService, modelDownloader, broadcastService }
  }

  it('registers exactly 17 IPC handlers', () => {
    setup()
    expect(ipcMain.handle).toHaveBeenCalledTimes(17)
  })

  describe('DeepL handlers', () => {
    it('save-deepl-api-key calls configService.setDeepLApiKey', () => {
      const { configService } = setup()
      invoke('save-deepl-api-key', 'my-deepl-key')
      expect(configService.getDeepLApiKey()).toBe('my-deepl-key')
    })

    it('delete-deepl-api-key nullifies the key', () => {
      const { configService } = setup()
      configService.setDeepLApiKey('existing-key')
      invoke('delete-deepl-api-key')
      expect(configService.getDeepLApiKey()).toBeNull()
    })

    it('check-deepl-api-key returns boolean', async () => {
      const { configService } = setup()
      configService.setDeepLApiKey('key')
      expect(await invoke('check-deepl-api-key')).toBe(true)

      configService.setDeepLApiKey(null)
      expect(await invoke('check-deepl-api-key')).toBe(false)
    })
  })

  describe('OpenAI handlers', () => {
    it('save-openai-api-key calls configService.setOpenAIKey', () => {
      const { configService } = setup()
      invoke('save-openai-api-key', 'sk-test')
      expect(configService.getOpenAIKey()).toBe('sk-test')
    })

    it('delete-openai-api-key nullifies the key', () => {
      const { configService } = setup()
      configService.setOpenAIKey('existing')
      invoke('delete-openai-api-key')
      expect(configService.getOpenAIKey()).toBeNull()
    })

    it('check-openai-api-key returns boolean', async () => {
      const { configService } = setup()
      configService.setOpenAIKey('sk-key')
      expect(await invoke('check-openai-api-key')).toBe(true)
    })
  })

  describe('Text Tune AI handlers', () => {
    it('save-text-tune-server-url pings then saves', async () => {
      const { configService, pingService } = setup()
      vi.mocked(pingService.ping).mockResolvedValueOnce({ data: { message: 'ok' }, status: 200 })

      await invoke('save-text-tune-server-url', 'http://localhost:8080')

      expect(pingService.ping).toHaveBeenCalledWith('http://localhost:8080')
      expect(configService.getTextTuneServerUrl()).toBe('http://localhost:8080')
    })

    it('save-text-tune-server-url throws if ping fails', async () => {
      const { configService, pingService } = setup()
      vi.mocked(pingService.ping).mockRejectedValueOnce(new Error('Connection refused'))

      await expect(invoke('save-text-tune-server-url', 'http://bad:1')).rejects.toThrow('Connection refused')
      expect(configService.getTextTuneServerUrl()).toBeNull()
    })

    it('set-text-tune-server-url saves without ping', async () => {
      const { configService } = setup()
      await invoke('set-text-tune-server-url', 'http://direct:3000')
      expect(configService.getTextTuneServerUrl()).toBe('http://direct:3000')
    })

    it('delete-text-tune-server-url nullifies url', async () => {
      const { configService } = setup()
      configService.setTextTuneServerUrl('http://old:8080')
      await invoke('delete-text-tune-server-url')
      expect(configService.getTextTuneServerUrl()).toBeNull()
    })
  })

  describe('model download handlers', () => {
    it('check-model-downloaded delegates', async () => {
      const { modelDownloader } = setup()
      vi.mocked(modelDownloader.isDownloaded).mockReturnValue(true)

      expect(await invoke('check-model-downloaded')).toBe(true)
      expect(modelDownloader.isDownloaded).toHaveBeenCalled()
    })

    it('download-model calls ensureExists with progress callback', async () => {
      const { modelDownloader } = setup()
      vi.mocked(modelDownloader.ensureExists).mockImplementation(async (cb) => {
        cb?.(50)
        cb?.(100)
        return '/tmp/models/test.gguf'
      })

      await invoke('download-model')
      expect(modelDownloader.ensureExists).toHaveBeenCalled()
    })

    it('delete-model removes file if exists', async () => {
      setup()
      vi.mocked(fs.existsSync).mockReturnValueOnce(true)
      await invoke('delete-model')
      expect(fs.rmSync).toHaveBeenCalledWith('/tmp/models/test.gguf', { force: true })
    })

    it('delete-model skips if file does not exist', async () => {
      setup()
      vi.mocked(fs.existsSync).mockReturnValueOnce(false)
      await invoke('delete-model')
      expect(fs.rmSync).not.toHaveBeenCalled()
    })
  })

  describe('get-backend-state', () => {
    it('returns full state snapshot', () => {
      const { configService } = setup()
      configService.setWorkingMode('chatgpt')
      configService.setOllamaModel('phi3')
      configService.setTextTuneServerUrl('http://s:1')

      const state = invoke('get-backend-state')
      expect(state.workingMode).toBe('chatgpt')
      expect(state.ollamaModel).toBe('phi3')
      expect(state.textTuneServerUrl).toBe('http://s:1')
      expect(state.translateHistory).toEqual([])
    })
  })

  describe('set-working-mode', () => {
    it('updates config and fix service', async () => {
      const { configService, fixService } = setup()
      await invoke('set-working-mode', 'ollama')
      expect(configService.getWorkingMode()).toBe('ollama')
      expect(fixService.getMode()).toBe('ollama')
    })
  })

  describe('model setters', () => {
    it('set-ollama-model saves model', async () => {
      const { configService } = setup()
      await invoke('set-ollama-model', 'mistral')
      expect(configService.getOllamaModel()).toBe('mistral')
    })

    it('set-ollama-model accepts null', async () => {
      const { configService } = setup()
      configService.setOllamaModel('old-model')
      await invoke('set-ollama-model', null)
      expect(configService.getOllamaModel()).toBeNull()
    })

    it('set-openai-model saves model', async () => {
      const { configService } = setup()
      await invoke('set-openai-model', 'gpt-5-mini')
      expect(configService.getOpenAIModel()).toBe('gpt-5-mini')
    })

    it('set-text-tune-model saves model', async () => {
      const { configService } = setup()
      await invoke('set-text-tune-model', 'Text-Tune-Base-v13')
      expect(configService.getTextTuneModel()).toBe('Text-Tune-Base-v13')
    })
  })
})
