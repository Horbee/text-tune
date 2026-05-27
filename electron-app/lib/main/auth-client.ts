import { createAuthClient } from 'better-auth/client'
import { electronClient } from '@better-auth/electron/client'
import { storage } from '@better-auth/electron/storage'
import { magicLinkClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    electronClient({
      protocol: 'texttune',
      signInURL: 'http://localhost:3000/sign-in',
      storage: storage(),
    }),
    magicLinkClient(),
  ],
})

export type AuthClient = typeof authClient
