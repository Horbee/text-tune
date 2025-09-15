import { app, BrowserWindow, globalShortcut, Notification } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createAppWindow, createTray, fixCurrentLine, fixSelection, registerAppIPC } from './app'
import { loadConfig, saveConfig } from './config'
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.horbee.text-tune')

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
  const config = loadConfig()
  if (!config.backgroundNotificationShown) {
    // TODO: refactor notification to use NotificationService
    new Notification({
      title: 'Text Tune',
      body: 'Text Tune is running in the background.',
    })
      .on('click', () => {
        createAppWindow()
      })
      .show()

    saveConfig({ backgroundNotificationShown: true })
  }
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
