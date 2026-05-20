import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenAIProvider } from '@/lib/main/providers/OpenAIProvider'
import { NotificationService } from '@/lib/main/services/NotificationService'
import { LogService } from '@/lib/main/services/LogService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'

describe('OpenAIProvider', () => {
  let modelGetter: () => string | null
  let keyGetter: () => string | null
  let notificationService: NotificationService
  let logService: LogService
  let broadcastService: BroadcastService
  let provider: OpenAIProvider

  beforeEach(() => {
    vi.clearAllMocks()
    modelGetter = vi.fn()
    keyGetter = vi.fn()
    notificationService = new NotificationService()
    logService = new LogService()
    broadcastService = new BroadcastService()
    provider = new OpenAIProvider(modelGetter, keyGetter, notificationService, logService, broadcastService)
  })

  it('has id "chatgpt"', () => {
    expect(provider.id).toBe('chatgpt')
  })

  describe('ensureReady()', () => {
    it('throws and broadcasts focusModelSelector when no model', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      vi.mocked(keyGetter).mockReturnValue('sk-key')
      const spy = vi.spyOn(broadcastService, 'focusModelSelector')

      await expect(provider.ensureReady()).rejects.toThrow('No OpenAI model selected')
      expect(spy).toHaveBeenCalled()
    })

    it('throws and broadcasts focusApiKeyInput when no key', async () => {
      vi.mocked(modelGetter).mockReturnValue('gpt-5-nano')
      vi.mocked(keyGetter).mockReturnValue(null)
      const spy = vi.spyOn(broadcastService, 'focusApiKeyInput')

      await expect(provider.ensureReady()).rejects.toThrow('No OpenAI API key configured')
      expect(spy).toHaveBeenCalled()
    })

    it('resolves when both model and key are present', async () => {
      vi.mocked(modelGetter).mockReturnValue('gpt-5')
      vi.mocked(keyGetter).mockReturnValue('sk-valid')
      await expect(provider.ensureReady()).resolves.toBeUndefined()
    })
  })

  describe('fix()', () => {
    it('calls client.responses.parse with correct arguments', async () => {
      vi.mocked(modelGetter).mockReturnValue('gpt-5-mini')
      vi.mocked(keyGetter).mockReturnValue('sk-key')
      await provider.ensureReady()

      const OpenAI = await import('openai')
      const mockClient = (OpenAI.default as any).mock.results[0]?.value
      mockClient.responses.parse.mockResolvedValueOnce({
        output_parsed: { correctedText: 'fixed output' },
      })

      const result = await provider.fix('helo world')

      expect(mockClient.responses.parse).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5-mini',
          reasoning: { effort: 'minimal' },
        }),
      )
      expect(result).toBe('fixed output')
    })

    it('throws if provider not initialized', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      await expect(provider.fix('text')).rejects.toThrow('OpenAI provider not initialized')
    })

    it('catches errors and returns fallback string', async () => {
      vi.mocked(modelGetter).mockReturnValue('gpt-5-nano')
      vi.mocked(keyGetter).mockReturnValue('sk-key')
      await provider.ensureReady()

      const OpenAI = await import('openai')
      const mockClient = (OpenAI.default as any).mock.results[0]?.value
      mockClient.responses.parse.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      const result = await provider.fix('test')
      expect(result).toBe('An error occurred while fixing the text.')
    })
  })

  describe('getModel()', () => {
    it('delegates to modelGetter', () => {
      vi.mocked(modelGetter).mockReturnValue('gpt-5')
      expect(provider.getModel()).toBe('gpt-5')
    })
  })
})
