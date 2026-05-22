import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

type AuthStore = {
  user: User | null
  isLoading: boolean

  fetchSession: () => Promise<void>
  requestAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,

  fetchSession: async () => {
    set({ isLoading: true })
    try {
      const userPromise = window.getUser()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Session fetch timed out')), 2000),
      )

      const user = await Promise.race([userPromise, timeoutPromise])
      set({ user: user as User | null, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  requestAuth: async () => {
    await window.requestAuth()
  },

  signOut: async () => {
    await window.signOut()
    set({ user: null })
  },
}))
