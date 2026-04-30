import { create } from 'zustand'

interface UIStore {
  loadingDone: boolean
  setLoadingDone: () => void
  introOpen: boolean
  openIntro: () => void
  closeIntro: () => void
}

export const useUIStore = create<UIStore>(set => ({
  loadingDone: false,
  setLoadingDone: () => set({ loadingDone: true }),
  introOpen: true,
  openIntro: () => set({ introOpen: true }),
  closeIntro: () => set({ introOpen: false }),
}))
