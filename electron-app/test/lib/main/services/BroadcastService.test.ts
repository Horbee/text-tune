import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BroadcastService } from '@/lib/main/services/BroadcastService'
import { BrowserWindow } from 'electron'

describe('BroadcastService', () => {
  let service: BroadcastService
  let mockWindow: any
  let mockWebContents: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockWebContents = { send: vi.fn() }
    mockWindow = { webContents: mockWebContents }
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([mockWindow])
    service = new BroadcastService()
  })

  it('sends fixSuccess to all renderer windows', () => {
    const payload = { historyState: [{ id: 1, originalText: 'hello', model: 'deepl', usedProvider: 'deepl' as const, isFixing: false }] }

    service.fixSuccess(payload)

    expect(mockWebContents.send).toHaveBeenCalledWith('fix-success', payload)
  })

  it('sends error to all renderer windows', () => {
    const payload = { title: 'Fix Failed', message: 'Something went wrong' }

    service.error(payload)

    expect(mockWebContents.send).toHaveBeenCalledWith('error', payload)
  })

  it('sends focusApiKeyInput to all renderer windows', () => {
    service.focusApiKeyInput()
    expect(mockWebContents.send).toHaveBeenCalledWith('focus-api-key-input', undefined)
  })

  it('sends focusModelSelector to all renderer windows', () => {
    service.focusModelSelector()
    expect(mockWebContents.send).toHaveBeenCalledWith('focus-model-selector', undefined)
  })

  it('sends focusTextTuneUrlInput to all renderer windows', () => {
    service.focusTextTuneUrlInput()
    expect(mockWebContents.send).toHaveBeenCalledWith('focus-text-tune-url-input', undefined)
  })

  it('sends modelDownloadProgress to all renderer windows', () => {
    service.modelDownloadProgress(42)
    expect(mockWebContents.send).toHaveBeenCalledWith('model-download-progress', { percentage: 42 })
  })

  it('handles no windows being open gracefully', () => {
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([])
    expect(() => service.fixSuccess({ historyState: [] })).not.toThrow()
  })

  it('sends to all windows when multiple are open', () => {
    const webContents2 = { send: vi.fn() }
    const window2 = { webContents: webContents2 }
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([mockWindow, window2])

    service.error({ title: 'Test', message: 'Multi-window' })

    expect(mockWebContents.send).toHaveBeenCalledWith('error', { title: 'Test', message: 'Multi-window' })
    expect(webContents2.send).toHaveBeenCalledWith('error', { title: 'Test', message: 'Multi-window' })
  })
})
