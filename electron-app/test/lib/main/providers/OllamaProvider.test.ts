import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OllamaProvider } from '@/lib/main/providers/OllamaProvider'
import { NotificationService } from '@/lib/main/services/NotificationService'
import { LogService } from '@/lib/main/services/LogService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'

vi.mock('axios', () => ({
  default: { post: vi.fn() },
}))

describe('OllamaProvider', () => {
  let modelGetter: () => string | null
  let notificationService: NotificationService
  let logService: LogService
  let broadcastService: BroadcastService
  let provider: OllamaProvider

  beforeEach(() => {
    vi.clearAllMocks()
    modelGetter = vi.fn()
    notificationService = new NotificationService()
    logService = new LogService()
    broadcastService = new BroadcastService()
    provider = new OllamaProvider(modelGetter, notificationService, logService, broadcastService)
  })

  it('has id "ollama"', () => {
    expect(provider.id).toBe('ollama')
  })

  describe('ensureReady()', () => {
    it('throws and broadcasts focusModelSelector when no model', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      const spy = vi.spyOn(broadcastService, 'focusModelSelector')

      await expect(provider.ensureReady()).rejects.toThrow('No Ollama model selected')
      expect(spy).toHaveBeenCalled()
    })

    it('resolves when model is selected', async () => {
      vi.mocked(modelGetter).mockReturnValue('llama3')
      await expect(provider.ensureReady()).resolves.toBeUndefined()
    })
  })

  describe('fix()', () => {
    it('POSTs to /api/generate with correct payload', async () => {
      const axios = await import('axios')
      vi.mocked(axios.default.post).mockResolvedValueOnce({ data: { response: 'corrected text' } })
      vi.mocked(modelGetter).mockReturnValue('mistral')

      const result = await provider.fix('hello')

      expect(axios.default.post).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({ model: 'mistral', stream: false }),
        expect.any(Object),
      )
      expect(result).toBe('corrected text')
    })

    it('throws if no model selected', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      await expect(provider.fix('test')).rejects.toThrow('No Ollama model selected')
    })

    it('catches errors and returns fallback string', async () => {
      const axios = await import('axios')
      vi.mocked(axios.default.post).mockRejectedValueOnce(new Error('Connection refused'))
      vi.mocked(modelGetter).mockReturnValue('llama3')

      const result = await provider.fix('test')
      expect(result).toBe('An error occurred while fixing the text.')
    })
  })

  describe('getModel()', () => {
    it('delegates to modelGetter', () => {
      vi.mocked(modelGetter).mockReturnValue('phi3')
      expect(provider.getModel()).toBe('phi3')
    })
  })
})
