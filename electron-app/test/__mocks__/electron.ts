import path from 'path'
import os from 'os'

const TEST_USER_DATA = path.join(os.tmpdir(), 'text-tune-test')

export const app = {
  getPath(name: string): string {
    if (name === 'userData') return TEST_USER_DATA
    return path.join(TEST_USER_DATA, name)
  },
  commandLine: {
    appendSwitch(_switch: string, _value?: string) {},
  },
}

export const safeStorage = {
  isEncryptionAvailable: vi.fn().mockReturnValue(true),
  encryptString: vi.fn((data: string) => Buffer.from(data)),
  decryptString: vi.fn((buffer: Buffer) => buffer.toString()),
}

export const clipboard = {
  readText: vi.fn().mockReturnValue(''),
  writeText: vi.fn(),
}

export const Notification = vi.fn(function (this: any, _options: any) {
  this.on = vi.fn().mockReturnThis()
  this.show = vi.fn()
  return this
})

export const BrowserWindow = {
  getAllWindows: vi.fn().mockReturnValue([]),
}

const handlerStore = new Map<string, (...args: any[]) => any>()

export const ipcMain = {
  handle: vi.fn((channel: string, handler: (...args: any[]) => any) => {
    handlerStore.set(channel, handler)
  }),
}

export function getIPCHandler(channel: string) {
  return handlerStore.get(channel)
}

export function resetIPCHandlers() {
  handlerStore.clear()
}

export const globalShortcut = {
  register: vi.fn(),
  unregisterAll: vi.fn(),
}

vi.mock('electron', () => ({
  app,
  safeStorage,
  clipboard,
  Notification,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  getIPCHandler,
  resetIPCHandlers,
}))
