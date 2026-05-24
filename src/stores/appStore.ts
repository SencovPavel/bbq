import { create } from 'zustand'
import type { Screen, Tab } from '../types'

interface AppStore {
  screen: Screen
  tab: Tab
  currentEventId: string | null
  setScreen: (screen: Screen) => void
  setTab: (tab: Tab) => void
  setCurrentEventId: (id: string | null) => void
  enterEvent: (id: string) => void
  exitEvent: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  screen: 'loading',
  tab: 'events',
  currentEventId: null,
  setScreen: (screen) => set({ screen }),
  setTab: (tab) => set({ tab }),
  setCurrentEventId: (currentEventId) => set({ currentEventId }),
  enterEvent: (id) => set({ currentEventId: id, tab: 'list' }),
  exitEvent: () => set({ currentEventId: null, tab: 'events' }),
}))
