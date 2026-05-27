import { BrowserWindow } from 'electron'
import { IPCChannel, IPC_CHANNELS, FixSuccessPayload, ErrorPayload, ModelDownloadProgressPayload } from '../ipc/channels'

export class BroadcastService {
  /**
   * Send a message to all renderer windows
   */
  send<T = unknown>(channel: IPCChannel, payload: T): void {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channel, payload)
    })
  }

  /**
   * Broadcast a fix success event with history state
   */
  fixSuccess(payload: FixSuccessPayload): void {
    this.send(IPC_CHANNELS.fixSuccess, payload)
  }

  /**
   * Broadcast an error event
   */
  error(payload: ErrorPayload): void {
    this.send(IPC_CHANNELS.error, payload)
  }

  /**
   * Request the frontend to focus the API key input
   */
  focusApiKeyInput(): void {
    this.send(IPC_CHANNELS.focusApiKeyInput, undefined)
  }

  /**
   * Request the frontend to focus the model selector
   */
  focusModelSelector(): void {
    this.send(IPC_CHANNELS.focusModelSelector, undefined)
  }

  modelDownloadProgress(percentage: number): void {
    this.send(IPC_CHANNELS.modelDownloadProgress, { percentage } satisfies ModelDownloadProgressPayload)
  }
}
