import { create } from 'zustand'
import type { ServerState } from '@shared/types'

type SendFn = (msg: Record<string, unknown>) => boolean

interface WsStore {
  serverState: ServerState | null
  wsOk: boolean
  /** Провал начальной загрузки данных (WS не подключился / таймаут). */
  loadError: boolean
  /** Счётчик ручных повторов — бамп заставляет useWebSocket переподключиться. */
  retryNonce: number
  send: SendFn
  setServerState: (state: ServerState) => void
  setWsOk: (ok: boolean) => void
  setLoadError: (v: boolean) => void
  retryConnect: () => void
  setSend: (fn: SendFn) => void
  reset: () => void
}

export const useWsStore = create<WsStore>((set) => ({
  serverState: null,
  wsOk: false,
  loadError: false,
  retryNonce: 0,
  send: () => false,
  setServerState: (serverState) => set({ serverState, wsOk: true, loadError: false }),
  setWsOk: (wsOk) => set({ wsOk }),
  setLoadError: (loadError) => set({ loadError }),
  retryConnect: () => set((s) => ({ loadError: false, retryNonce: s.retryNonce + 1 })),
  setSend: (send) => set({ send }),
  reset: () => set({ serverState: null, wsOk: false, loadError: false }),
}))
