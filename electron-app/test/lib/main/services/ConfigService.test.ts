import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resetFs } from '@/test/helpers/fs-store'
import { safeStorage } from 'electron'
import { ConfigService } from '@/lib/main/services/ConfigService'

describe('ConfigService', () => {
  beforeEach(() => {
    resetFs()
    vi.clearAllMocks()
  })

  it('starts with defaults', () => {
    const svc = new ConfigService()
    expect(svc.getWorkingMode()).toBe('tt-ai')
    expect(svc.getOllamaModel()).toBeNull()
    expect(svc.getDeepLApiKey()).toBeNull()
    expect(svc.getLastWindowSize()).toBeNull()
  })

  describe('regular config', () => {
    it('round-trips workingMode', () => {
      const svc = new ConfigService()
      svc.setWorkingMode('chatgpt')
      expect(svc.getWorkingMode()).toBe('chatgpt')
    })

    it('round-trips ollamaModel', () => {
      const svc = new ConfigService()
      svc.setOllamaModel('llama3')
      expect(svc.getOllamaModel()).toBe('llama3')
    })

    it('round-trips openAIModel', () => {
      const svc = new ConfigService()
      svc.setOpenAIModel('gpt-5')
      expect(svc.getOpenAIModel()).toBe('gpt-5')
    })

    it('round-trips server url', () => {
      const svc = new ConfigService()
      svc.setTextTuneServerUrl('http://x:1')
      expect(svc.getTextTuneServerUrl()).toBe('http://x:1')
    })

    it('round-trips textTuneModel', () => {
      const svc = new ConfigService()
      svc.setTextTuneModel('Small')
      expect(svc.getTextTuneModel()).toBe('Small')
    })

    it('round-trips background notification', () => {
      const svc = new ConfigService()
      svc.setBackgroundNotificationShown(true)
      expect(svc.isBackgroundNotificationShown()).toBe(true)
    })

    it('round-trips window size', () => {
      const svc = new ConfigService()
      svc.setLastWindowSize({ width: 1, height: 2 })
      expect(svc.getLastWindowSize()).toEqual({ width: 1, height: 2 })
    })
  })

  describe('secure config', () => {
    it('round-trips deepl key', () => {
      const svc = new ConfigService()
      svc.setDeepLApiKey('secret')
      expect(svc.getDeepLApiKey()).toBe('secret')
    })

    it('round-trips openai key', () => {
      const svc = new ConfigService()
      svc.setOpenAIKey('sk-key')
      expect(svc.getOpenAIKey()).toBe('sk-key')
    })

    it('persists on set', () => {
      const svc = new ConfigService()
      svc.setDeepLApiKey('k')
      expect(safeStorage.encryptString).toHaveBeenCalled()
    })
  })

  describe('resetSecureConfig()', () => {
    it('nullifies both keys', () => {
      const svc = new ConfigService()
      svc.setDeepLApiKey('a')
      svc.setOpenAIKey('b')
      svc.resetSecureConfig()
      expect(svc.getDeepLApiKey()).toBeNull()
      expect(svc.getOpenAIKey()).toBeNull()
    })
  })
})
