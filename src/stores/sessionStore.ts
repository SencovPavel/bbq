import { create } from 'zustand'
import type { User } from '../types'

interface SessionStore {
  me: User | null
  groupId: string | null
  setMe: (me: User | null) => void
  setGroupId: (id: string | null) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  me: null,
  groupId: null,
  setMe: (me) => set({ me }),
  setGroupId: (groupId) => set({ groupId }),
}))
