import { create } from 'zustand'
import type { Screen, Tab } from '../types'

interface AppStore {
  screen: Screen
  tab: Tab
  currentEventId: string | null
  showEventSheet: boolean
  setScreen: (screen: Screen) => void
  setTab: (tab: Tab) => void
  setCurrentEventId: (id: string | null) => void
  setShowEventSheet: (show: boolean) => void
  enterEvent: (id: string) => void
  exitEvent: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  screen: 'loading',
  tab: 'list',
  currentEventId: null,
  showEventSheet: false,
  setScreen: (screen) => set({ screen }),
  setTab: (tab) => set({ tab }),
  setCurrentEventId: (currentEventId) => set({ currentEventId }),
  setShowEventSheet: (showEventSheet) => set({ showEventSheet }),
  enterEvent: (id) => set({ currentEventId: id, showEventSheet: false }),
  exitEvent: () => set({ currentEventId: null }),
}))
