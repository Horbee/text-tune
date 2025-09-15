import { Notification } from 'electron'
import { createOrShowWindow } from '@/lib/main/app'

export class NotificationService {
  showError(title: string, body: string, focusAction?: () => void) {
    new Notification({ title, body })
      .on('click', () => {
        if (focusAction) focusAction()
        else createOrShowWindow()
      })
      .show()
  }

  showInfo(title: string, body: string, onClick?: () => void) {
    new Notification({ title, body })
      .on('click', () => {
        onClick?.()
      })
      .show()
  }
}
