import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FixService } from '@/lib/main/services/FixService'
import { BroadcastService } from '@/lib/main/services/BroadcastService'
import { Provider } from '@/lib/main/providers/Provider'

describe('FixService', () => {
  let fixService: FixService
  let broadcastService: BroadcastService
  let mockProvider: Provider

  beforeEach(() => {
    vi.clearAllMocks()
    broadcastService = new BroadcastService()
    mockProvider = {
      id: 'deepl',
      ensureReady: vi.fn().mockResolvedValue(undefined),
      fix: vi.fn().mockResolvedValue('fixed text'),
      getModel: vi.fn().mockReturnValue('DeepL'),
    }
    fixService = new FixService('deepl', broadcastService)
    fixService.registerProvider(mockProvider)
  })

  describe('mode management', () => {
    it('starts with the given initial mode', () => {
      expect(fixService.getMode()).toBe('deepl')
    })

    it('switches mode via setMode', () => {
      fixService.setMode('chatgpt')
      expect(fixService.getMode()).toBe('chatgpt')
    })
  })

  describe('fix()', () => {
    it('throws when no provider is registered for the active mode', async () => {
      fixService.setMode('tt-ai')
      await expect(fixService.fix('test')).rejects.toThrow(
        'No provider registered for mode tt-ai',
      )
    })

    it('calls ensureReady before fix', async () => {
      await fixService.fix('hello world')
      expect(mockProvider.ensureReady).toHaveBeenCalled()
      expect(mockProvider.fix).toHaveBeenCalledWith('hello world')
      expect(mockProvider.ensureReady.mock.invocationCallOrder[0]).toBeLessThan(
        mockProvider.fix.mock.invocationCallOrder[0],
      )
    })

    it('returns original and fixed text', async () => {
      const result = await fixService.fix('hello world')
      expect(result).toEqual({ original: 'hello world', fixed: 'fixed text' })
    })

    it('broadcasts fix-success twice (in-progress then completed)', async () => {
      const calls: any[] = []
      vi.spyOn(broadcastService, 'fixSuccess').mockImplementation((p) => {
        calls.push(JSON.parse(JSON.stringify(p)))
      })

      await fixService.fix('hello')

      expect(calls).toHaveLength(2)
      expect(calls[0].historyState[0].isFixing).toBe(true)
      expect(calls[1].historyState[0].isFixing).toBe(false)
      expect(calls[1].historyState[0].fixedText).toBe('fixed text')
    })

    it('broadcasts correct history metadata', async () => {
      const spy = vi.spyOn(broadcastService, 'fixSuccess')
      await fixService.fix('test text')

      const finalCall = spy.mock.calls[spy.mock.calls.length - 1][0]
      const item = finalCall.historyState[0]
      expect(item.originalText).toBe('test text')
      expect(item.model).toBe('DeepL')
      expect(item.usedProvider).toBe('deepl')
    })

    it('accumulates history across multiple fixes', async () => {
      await fixService.fix('first')
      await fixService.fix('second')

      const history = fixService.getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].id).toBe(1)
      expect(history[1].id).toBe(2)
    })
  })

  describe('getHistory()', () => {
    it('returns empty array initially', () => {
      expect(fixService.getHistory()).toEqual([])
    })
  })
})
