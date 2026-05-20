import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clipboard } from 'electron'
import { keyboard } from '@nut-tree-fork/nut-js'

import { ClipboardService } from '@/lib/main/services/ClipboardService'

function setPlatform(p: NodeJS.Platform) {
  Object.defineProperty(process, 'platform', { value: p, configurable: true })
}

describe('ClipboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setPlatform('win32')
  })

  describe('captureSelection()', () => {
    it('reads clipboard after simulated copy', async () => {
      vi.mocked(clipboard.readText).mockReturnValue('captured content')
      const service = new ClipboardService()

      const result = await service.captureSelection()
      expect(result).toBe('captured content')
    })

    it('calls keyboard pressKey and releaseKey', async () => {
      const service = new ClipboardService()
      vi.mocked(clipboard.readText).mockReturnValue('')

      await service.captureSelection()

      expect(keyboard.pressKey).toHaveBeenCalled()
      expect(keyboard.releaseKey).toHaveBeenCalled()
    })
  })

  describe('replaceSelection()', () => {
    it('writes text to clipboard and simulates paste', async () => {
      const service = new ClipboardService()
      await service.replaceSelection('replacement text')

      expect(clipboard.writeText).toHaveBeenCalledWith('replacement text')
      expect(keyboard.pressKey).toHaveBeenCalled()
      expect(keyboard.releaseKey).toHaveBeenCalled()
    })
  })

  describe('selectCurrentLine()', () => {
    it('uses Shift+Home on non-macOS', () => {
      setPlatform('win32')
      const service = new ClipboardService()

      service.selectCurrentLine()

      expect(keyboard.pressKey).toHaveBeenCalledWith(expect.anything(), expect.anything())
    })

    it('uses Cmd+Shift+Left on macOS', () => {
      setPlatform('darwin')
      const service = new ClipboardService()

      service.selectCurrentLine()

      expect(keyboard.pressKey).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything())
    })
  })
})
