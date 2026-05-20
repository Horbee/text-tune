import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorHandler } from '@/lib/main/services/ErrorHandler'
import { NotificationService } from '@/lib/main/services/NotificationService'
import { LogService } from '@/lib/main/services/LogService'

describe('ErrorHandler', () => {
  let handler: ErrorHandler
  let notifier: NotificationService

  beforeEach(() => {
    vi.clearAllMocks()
    notifier = new NotificationService()
    handler = new ErrorHandler(notifier, new LogService())
  })

  describe('providerError()', () => {
    it('shows error notification for provider failures', () => {
      const spy = vi.spyOn(notifier, 'showError')
      handler.providerError('deepl', new Error('API key invalid'))
      expect(spy).toHaveBeenCalledWith('Text Tune', 'API key invalid')
    })

    it('handles non-Error objects', () => {
      const spy = vi.spyOn(notifier, 'showError')
      handler.providerError('deepl', 'some string error')
      expect(spy).toHaveBeenCalledWith('Text Tune', 'An unexpected error occurred.')
    })

    it('handles null/undefined error', () => {
      const spy = vi.spyOn(notifier, 'showError')
      handler.providerError('deepl', null)
      expect(spy).toHaveBeenCalledWith('Text Tune', 'An unexpected error occurred.')
    })
  })

  describe('general()', () => {
    it('shows error notification with context', () => {
      const spy = vi.spyOn(notifier, 'showError')
      handler.general('fixSelection', new Error('clipboard failed'))
      expect(spy).toHaveBeenCalledWith('Text Tune', 'clipboard failed')
    })

    it('handles non-Error objects', () => {
      const spy = vi.spyOn(notifier, 'showError')
      handler.general('fixSelection', undefined)
      expect(spy).toHaveBeenCalledWith('Text Tune', 'An unexpected error occurred.')
    })
  })
})
