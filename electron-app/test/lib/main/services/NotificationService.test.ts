import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Notification } from 'electron'
import { createOrShowWindow } from '@/lib/main/app'
import { NotificationService } from '@/lib/main/services/NotificationService'

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new NotificationService()
  })

  describe('showError()', () => {
    it('creates Notification with correct title/body', () => {
      service.showError('Error Title', 'Error body')
      expect(Notification).toHaveBeenCalledWith({ title: 'Error Title', body: 'Error body' })
    })
  })

  describe('showInfo()', () => {
    it('creates Notification with correct title/body', () => {
      service.showInfo('Info Title', 'Info body')
      expect(Notification).toHaveBeenCalledWith({ title: 'Info Title', body: 'Info body' })
    })
  })
})
