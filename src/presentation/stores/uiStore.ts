import { create } from 'zustand'

interface UIStore {
  loadingDone: boolean
  setLoadingDone: () => void
}

export const useUIStore = create<UIStore>(set => ({
  loadingDone: false,
  setLoadingDone: () => set({ loadingDone: true }),
}))
