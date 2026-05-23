import { create } from 'zustand'
import type { Screen, Tab } from '../types'

interface AppStore {
  screen: Screen
  tab: Tab
  setScreen: (screen: Screen) => void
  setTab: (tab: Tab) => void
}

export const useAppStore = create<AppStore>((set) => ({
  screen: 'loading',
  tab: 'list',
  setScreen: (screen) => set({ screen }),
  setTab: (tab) => set({ tab }),
}))
