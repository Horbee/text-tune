import { BrowserWindow, shell, app, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { registerFrontendIPC } from '@/lib/frontend/ipcEvents'
import appIcon from '@/resources/build/icon.png?asset'

import { IPCChannel } from './ipc/channels'
import { LogService, NotificationService, ClipboardService, ConfigService, ErrorHandler, FixService } from './services'
import { DeepLProvider, OllamaProvider, OpenAIProvider } from './providers'

// Service singletons (lightweight)
let logService: LogService
let notificationService: NotificationService
let clipboardService: ClipboardService
let configService: ConfigService
let fixService: FixService
let errorHandler: ErrorHandler

function broadcastToAll(channel: IPCChannel, message: any) {
  BrowserWindow.getAllWindows().forEach((w) => {
    w.webContents.send(channel, message)
  })
}

export const fixCurrentLine = async () => {
  logService.debug('fixCurrentLine called')

  await clipboardService.selectCurrentLine()

  fixSelection()
}

export const fixSelection = async () => {
  logService.debug('fixSelection called')

  try {
    const original = await clipboardService.captureSelection()
    const result = await fixService.fix(original)

    await clipboardService.replaceSelection(result.fixed)
    broadcastToAll('fix-success', { historyState: result.history })
  } catch (err: any) {
    errorHandler.general('fixSelection', err)
    broadcastToAll('error', { title: 'Fix Failed', message: err?.message || 'Unknown error' })
  }
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
  // Register IPC events for the Frontend (now using services)
  registerFrontendIPC(configService, fixService)
}

export function getConfigService() {
  return configService
}

export function initServices(): void {
  // Initialize services
  logService = new LogService()
  notificationService = new NotificationService()
  clipboardService = new ClipboardService()
  configService = new ConfigService()
  errorHandler = new ErrorHandler(notificationService, logService)
  fixService = new FixService(configService.getWorkingMode())

  logService.info('Services initialized')

  // Register providers
  fixService.registerProvider(new DeepLProvider(() => configService.getDeepLApiKey(), notificationService, logService))
  fixService.registerProvider(new OllamaProvider(() => configService.getOllamaModel(), notificationService, logService))
  fixService.registerProvider(
    new OpenAIProvider(
      () => configService.getOpenAIModel(),
      () => configService.getOpenAIKey(),
      notificationService,
      logService
    )
  )

  logService.info('Providers registered')
}

export function createAppWindow(): void {
  const width = configService.getLastWindowSize()?.width || 1020
  const height = configService.getLastWindowSize()?.height || 700

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
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

  mainWindow.on('resized', () => {
    const [width, height] = mainWindow.getSize()
    configService.setLastWindowSize({ width, height })
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
