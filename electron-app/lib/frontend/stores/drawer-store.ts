import { create } from 'zustand'

type Store = {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void
}

export const useDrawerStore = create<Store>()((set) => ({
  drawerOpen: false,

  initStore: async () => {
    set({ drawerOpen: false })
  },
  setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
}))
