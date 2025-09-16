import { NotificationService } from './NotificationService'
import { LogService } from './LogService'

export class ErrorHandler {
  constructor(
    private notifier: NotificationService,
    private logger: LogService
  ) {}

  providerError(provider: string, error: any) {
    const message = error?.message || 'An unexpected error occurred.'
    this.logger.error(`Provider ${provider} failed: ${message}`)
    this.notifier.showError('Text Tune', message)
  }

  general(context: string, error: any) {
    const message = error?.message || 'An unexpected error occurred.'
    this.logger.error(`${context} failed: ${message}`)
    this.notifier.showError('Text Tune', message)
  }
}
