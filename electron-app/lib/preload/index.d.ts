import { ElectronAPI } from '@electron-toolkit/preload'
import type api from './api'

type BetterAuthUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
} | null

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof api
    // Exposed by @better-auth/electron/preload setupRenderer()
    getUser: () => Promise<BetterAuthUser>
    requestAuth: (options?: Record<string, unknown>) => Promise<void>
    signOut: () => Promise<void>
    authenticate: (data: { token: string }) => Promise<void>
    onAuthenticated: (callback: (user: BetterAuthUser) => Promise<void>) => () => void
    onUserUpdated: (callback: (user: BetterAuthUser) => Promise<void>) => () => void
    onAuthError: (callback: (context: unknown) => Promise<void>) => () => void
  }
}
