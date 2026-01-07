import { app, BrowserWindow, globalShortcut, Notification } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import {
  createAppWindow,
  createTray,
  fixCurrentLine,
  fixSelection,
  initServices,
  registerAppIPC,
  getConfigService,
  createOrShowWindow,
} from './app'

// Enable usage of Portal's globalShortcuts. This is essential for cases when
// the app runs in a Wayland session.
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal')

// Single instance lock - prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window instead.
    createOrShowWindow()
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.horbee.text-tune')

    // Init services
    initServices()

    registerAppIPC()
    // Create app window
    createAppWindow()
    createTray()
    globalShortcut.register('F9', fixCurrentLine)
    globalShortcut.register('F10', fixSelection)
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createAppWindow()
      }
    })
  })

  // Since we want to minimize the app to the tray, we don't quit the app when all windows are closed.
  app.on('window-all-closed', () => {
    const configService = getConfigService()
    if (!configService.isBackgroundNotificationShown()) {
      // TODO: refactor notification to use NotificationService
      new Notification({
        title: 'Text Tune',
        body: 'Text Tune is running in the background.',
      })
        .on('click', () => {
          createAppWindow()
        })
        .show()

      configService.setBackgroundNotificationShown(true)
    }
    // if (process.platform !== 'darwin') {
    //   app.quit()
    // }
  })

  app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})
}

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
