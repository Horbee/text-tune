import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeepLProvider } from '@/lib/main/providers/DeepLProvider'
import { NotificationService } from '@/lib/main/services/NotificationService'
import { LogService } from '@/lib/main/services/LogService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'

describe('DeepLProvider', () => {
  let apiKeyGetter: () => string | null
  let notificationService: NotificationService
  let logService: LogService
  let broadcastService: BroadcastService
  let provider: DeepLProvider

  beforeEach(() => {
    vi.clearAllMocks()
    apiKeyGetter = vi.fn()
    notificationService = new NotificationService()
    logService = new LogService()
    broadcastService = new BroadcastService()
    provider = new DeepLProvider(apiKeyGetter, notificationService, logService, broadcastService)
  })

  it('has id "deepl"', () => {
    expect(provider.id).toBe('deepl')
  })

  describe('ensureReady()', () => {
    it('throws and broadcasts focusApiKeyInput when no key', async () => {
      vi.mocked(apiKeyGetter).mockReturnValue(null)
      const spy = vi.spyOn(broadcastService, 'focusApiKeyInput')

      await expect(provider.ensureReady()).rejects.toThrow('No DeepL API key configured')
      expect(spy).toHaveBeenCalled()
    })

    it('resolves when API key is present', async () => {
      vi.mocked(apiKeyGetter).mockReturnValue('valid-key')
      await expect(provider.ensureReady()).resolves.toBeUndefined()
    })
  })

  describe('fix()', () => {
    it('translates text through the Deepl pipeline', async () => {
      vi.mocked(apiKeyGetter).mockReturnValue('valid-key')
      await provider.ensureReady()

      const result = await provider.fix('some english text')
      expect(result).toBe('translated text')
    })

    it('throws if provider not initialized', async () => {
      vi.mocked(apiKeyGetter).mockReturnValue(null)
      await expect(provider.fix('text')).rejects.toThrow('DeepL provider not initialized')
    })

    it('catches API errors and returns fallback string', async () => {
      vi.mocked(apiKeyGetter).mockReturnValue('valid-key')
      await provider.ensureReady()

      const { Translator } = await import('deepl-node')
      const mockInst = (Translator as any).mock.results[0]?.value
      if (mockInst) {
        mockInst.translateText.mockRejectedValueOnce(new Error('API quota exceeded'))
      }

      const result = await provider.fix('test text')
      expect(result).toBe('An error occurred while fixing the text.')
    })
  })

  describe('getModel()', () => {
    it('returns "DeepL"', () => {
      expect(provider.getModel()).toBe('DeepL')
    })
  })
})
