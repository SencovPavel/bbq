import { create } from 'zustand'

import { loadGroupUi, saveGroupUiPatch } from '@shared/lib/ui-persist'
import { useSessionStore } from './sessionStore'

import type { Screen, Tab } from '@shared/types'

interface AppStore {
  screen: Screen
  tab: Tab
  currentEventId: string | null
  showEventSheet: boolean
  setScreen: (screen: Screen) => void
  setTab: (tab: Tab) => void
  setCurrentEventId: (id: string | null) => void
  setShowEventSheet: (show: boolean) => void
  hydrateGroupUi: (groupId: string) => void
  enterEvent: (id: string) => void
  exitEvent: () => void
}

const persistUi = (patch: Parameters<typeof saveGroupUiPatch>[1]): void => {
  const groupId = useSessionStore.getState().groupId
  if (!groupId) return
  saveGroupUiPatch(groupId, patch)
}

export const useAppStore = create<AppStore>((set) => ({
  screen: 'loading',
  tab: 'list',
  currentEventId: null,
  showEventSheet: false,
  setScreen: (screen) => set({ screen }),
  setTab: (tab) => {
    set({ tab })
    persistUi({ tab })
  },
  setCurrentEventId: (currentEventId) => {
    set({ currentEventId })
    persistUi({ currentEventId })
  },
  setShowEventSheet: (showEventSheet) => set({ showEventSheet }),
  hydrateGroupUi: (groupId) => {
    const ui = loadGroupUi(groupId)
    set({
      tab: ui.tab,
      currentEventId: null, // авто-выбор активного события при входе в группу
    })
  },
  enterEvent: (id) => {
    set({ currentEventId: id, showEventSheet: false })
    persistUi({ currentEventId: id })
  },
  exitEvent: () => {
    set({ currentEventId: null })
    persistUi({ currentEventId: null })
  },
}))
