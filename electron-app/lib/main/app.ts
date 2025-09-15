import { BrowserWindow, shell, app, clipboard, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { registerFrontendIPC } from '@/lib/frontend/ipcEvents'
import { getSecureConfig } from '@/lib/main/secure-store'
import appIcon from '@/resources/build/icon.png?asset'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import { sleep } from '@/lib/main/utils'
import { fixTextFactory as fixTextFactoryDeepl } from '@/lib/main/deepl-fix'
import { fixTextFactory as fixTextFactoryOllama } from '@/lib/main/ollama-fix'
import { fixTextFactory as fixTextFactoryOpenAI } from '@/lib/main/openai-fix'
import { loadConfig } from '@/lib/main/config'

import type { HistoryItem, BackendState, FixTextFn } from './types'
import { IPCChannel } from './ipc/channels'
import { LogService, NotificationService } from './services'

// Service singletons (lightweight)
const logService = new LogService()
const notificationService = new NotificationService()

let fixText: FixTextFn | null = null
let backendState: BackendState = {
  workingMode: 'deepl',
  ollamaModel: null,
  openAIModel: null,
  translateHistory: [] as HistoryItem[],
}

function broadcastToAll(channel: IPCChannel, message: any) {
  BrowserWindow.getAllWindows().forEach((w) => {
    w.webContents.send(channel, message)
  })
}

export const fixCurrentLine = async () => {
  logService.debug('fixCurrentLine called')

  const isMac = process.platform === 'darwin'

  if (isMac) {
    await keyboard.pressKey(Key.LeftCmd, Key.LeftShift, Key.Left)
    await keyboard.releaseKey(Key.LeftCmd, Key.LeftShift, Key.Left)
  } else {
    await keyboard.pressKey(Key.LeftShift, Key.Home)
    await keyboard.releaseKey(Key.LeftShift, Key.Home)
  }

  fixSelection()
}

export const fixSelection = async () => {
  logService.debug('fixSelection called')

  if (!fixText) {
    if (backendState.workingMode === 'deepl') {
      const config = getSecureConfig()
      if (!config?.deeplApiKey) {
        broadcastToAll('error', {
          title: 'No API key found',
          message: 'Please enter a valid DeepL API key first.',
        })

        notificationService.showError('Text Tune', 'No DeepL API key found, enter a valid key first.', () => {
          createOrShowWindow()
          broadcastToAll('focus-api-key-input', {})
        })

        logService.error('No DeepL API key found')
        return
      }
      fixText = fixTextFactoryDeepl(config.deeplApiKey)
    } else if (backendState.workingMode === 'ollama') {
      if (!backendState.ollamaModel) {
        broadcastToAll('error', {
          title: 'No model selected',
          message: 'Please select a model first.',
        })

        notificationService.showError('Text Tune', 'No model selected, please select a model first.', () => {
          createOrShowWindow()
          broadcastToAll('focus-model-selector', {})
        })

        logService.error('No model selected')
        return
      }
      fixText = fixTextFactoryOllama(backendState.ollamaModel)
    } else if (backendState.workingMode === 'chatgpt') {
      const config = getSecureConfig()
      if (!config?.openaiApiKey) {
        broadcastToAll('error', {
          title: 'No API key found',
          message: 'Please enter a valid OpenAI API key first.',
        })

        notificationService.showError('Text Tune', 'No OpenAI API key found, enter a valid key first.', () => {
          createOrShowWindow()
          broadcastToAll('focus-api-key-input', {})
        })

        logService.error('No OpenAI API key found')
        return
      }
      if (!backendState.openAIModel) {
        broadcastToAll('error', {
          title: 'No model selected',
          message: 'Please select a model first.',
        })

        notificationService.showError('Text Tune', 'No model selected, please select a model first.', () => {
          createOrShowWindow()
          broadcastToAll('focus-model-selector', {})
        })

        logService.error('No model selected')
        return
      }
      fixText = fixTextFactoryOpenAI(backendState.openAIModel, config.openaiApiKey)
    }
  }

  const isMac = process.platform === 'darwin'
  const cmdKey = isMac ? Key.LeftCmd : Key.LeftControl

  await keyboard.pressKey(cmdKey, Key.C)
  await keyboard.releaseKey(cmdKey, Key.C)

  await sleep(100)

  const text = clipboard.readText()
  console.log('Original text:', text)

  const fixedText = (await fixText?.(text)) || ''
  console.log('Fixed text:', fixedText)

  clipboard.writeText(fixedText)
  await sleep(100)

  await keyboard.pressKey(cmdKey, Key.V)
  await keyboard.releaseKey(cmdKey, Key.V)

  backendState.translateHistory.push({
    id: backendState.translateHistory.length + 1,
    type: 'original',
    text,
  })

  backendState.translateHistory.push({
    id: backendState.translateHistory.length + 1,
    type: 'fix',
    text: fixedText,
  })

  broadcastToAll('fix-success', {
    historyState: backendState.translateHistory,
  })
}

export function createTray(): void {
  const trayIconAssetPath =
    process.platform === 'darwin'
      ? join(app.getAppPath(), 'app/assets/trayIconTemplate@4x.png')
      : join(app.getAppPath(), 'app/assets/trayIcon.png')
  const icon = nativeImage.createFromPath(trayIconAssetPath)
  if (icon.isEmpty()) {
    console.error(`Failed to load tray icon: image created from path is empty. Path: ${trayIconAssetPath}`)
    return
  }

  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      type: 'normal',
      click: createOrShowWindow,
    },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: () => app.quit() },
  ])

  tray.setToolTip('Text Tune')

  // tray.setTitle("AI Text Fixer");
  tray.on('double-click', createOrShowWindow)

  tray.setContextMenu(contextMenu)
  console.log('Tray created successfully.')
}

export function registerAppIPC(): void {
  // Register IPC events for the Frontend
  registerFrontendIPC((newFixText) => {
    fixText = newFixText
  }, backendState)
}

export function createAppWindow(): void {
  // Load config, setup backend state
  const config = loadConfig()
  backendState.workingMode = config.workingMode
  backendState.ollamaModel = config.ollamaModel
  backendState.openAIModel = config.openAIModel

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    show: false,
    icon: appIcon,
    title: 'Text Tune',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  // Avoid showing the window before it's ready. (flashing effect)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open links in the default browser, rather than in the app.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

export function createOrShowWindow() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow()
  } else {
    BrowserWindow.getAllWindows()[0].show()
  }
}
