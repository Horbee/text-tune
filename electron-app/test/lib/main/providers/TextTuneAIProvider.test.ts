import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TextTuneAIProvider } from '@/lib/main/providers/TextTuneAIProvider'
import { NotificationService } from '@/lib/main/services/NotificationService'
import { LogService } from '@/lib/main/services/LogService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'

describe('TextTuneAIProvider', () => {
  let modelGetter: () => string | null
  let textTuneServerUrlGetter: () => string | null
  let modelDownloader: any
  let notificationService: NotificationService
  let logService: LogService
  let broadcastService: BroadcastService
  let provider: TextTuneAIProvider

  beforeEach(() => {
    vi.clearAllMocks()
    modelGetter = vi.fn()
    textTuneServerUrlGetter = vi.fn()
    modelDownloader = {}
    notificationService = new NotificationService()
    logService = new LogService()
    broadcastService = new BroadcastService()
    provider = new TextTuneAIProvider(
      modelGetter,
      textTuneServerUrlGetter,
      modelDownloader,
      notificationService,
      logService,
      broadcastService,
    )
  })

  it('has id "tt-ai"', () => {
    expect(provider.id).toBe('tt-ai')
  })

  describe('ensureReady()', () => {
    it('throws and broadcasts focusModelSelector when no model', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      const spy = vi.spyOn(broadcastService, 'focusModelSelector')

      await expect(provider.ensureReady()).rejects.toThrow('No Text Tune model selected')
      expect(spy).toHaveBeenCalled()
    })

    it('calls localEngine.ensureReady for Text-Tune-Small model', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Small')
      const { LocalInferenceEngine } = await import('@/lib/main/providers/tt-ai/LocalInferenceEngine')
      const mockEng = (LocalInferenceEngine as any).mock.results[0]?.value
      mockEng.isReady.mockReturnValue(false)

      await provider.ensureReady()

      expect(mockEng.ensureReady).toHaveBeenCalled()
    })

    it('skips ensureReady if local engine already ready', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Small')
      const { LocalInferenceEngine } = await import('@/lib/main/providers/tt-ai/LocalInferenceEngine')
      const mockEng = (LocalInferenceEngine as any).mock.results[0]?.value
      mockEng.isReady.mockReturnValue(true)

      await provider.ensureReady()

      expect(mockEng.ensureReady).not.toHaveBeenCalled()
    })

    it('validates server URL for Base model', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Base-v13')
      vi.mocked(textTuneServerUrlGetter).mockReturnValue('http://localhost:8080')

      await expect(provider.ensureReady()).resolves.toBeUndefined()
    })

    it('throws when server URL missing for Base model', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Base-v13')
      vi.mocked(textTuneServerUrlGetter).mockReturnValue(null)
      const spy = vi.spyOn(broadcastService, 'focusTextTuneUrlInput')

      await expect(provider.ensureReady()).rejects.toThrow('No Text Tune server URL configured')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('fix()', () => {
    it('delegates to local engine for Small model', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Small')
      const { LocalInferenceEngine } = await import('@/lib/main/providers/tt-ai/LocalInferenceEngine')
      const mockEng = (LocalInferenceEngine as any).mock.results[0]?.value
      mockEng.fix.mockResolvedValueOnce('locally fixed')

      const result = await provider.fix('input')

      expect(mockEng.fix).toHaveBeenCalledWith('input')
      expect(result).toBe('locally fixed')
    })

    it('delegates to remote client for Base model', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Base-v13')
      vi.mocked(textTuneServerUrlGetter).mockReturnValue('http://srv:4000')
      const { RemoteInferenceClient } = await import('@/lib/main/providers/tt-ai/RemoteInferenceClient')
      const mockRc = (RemoteInferenceClient as any).mock.results[0]?.value
      mockRc.fix.mockResolvedValueOnce('remote fixed')

      const result = await provider.fix('input')

      expect(mockRc.fix).toHaveBeenCalledWith('input', 'Text-Tune-Base-v13', 'http://srv:4000')
      expect(result).toBe('remote fixed')
    })

    it('throws if no model selected', async () => {
      vi.mocked(modelGetter).mockReturnValue(null)
      await expect(provider.fix('text')).rejects.toThrow('No Text Tune model selected')
    })

    it('throws for unknown model', async () => {
      vi.mocked(modelGetter).mockReturnValue('unknown-model')
      await expect(provider.fix('text')).rejects.toThrow('Unknown model: unknown-model')
    })

    it('throws if Base model has no server URL', async () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Base-v13')
      vi.mocked(textTuneServerUrlGetter).mockReturnValue(null)
      await expect(provider.fix('text')).rejects.toThrow('No Text Tune server URL configured')
    })
  })

  describe('getModel()', () => {
    it('delegates to modelGetter', () => {
      vi.mocked(modelGetter).mockReturnValue('Text-Tune-Small')
      expect(provider.getModel()).toBe('Text-Tune-Small')
    })
  })
})
