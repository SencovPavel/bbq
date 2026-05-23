import { create } from 'zustand'
import type { ServerState } from '../types'

type SendFn = (msg: Record<string, unknown>) => void

interface WsStore {
  serverState: ServerState | null
  wsOk: boolean
  send: SendFn
  setServerState: (state: ServerState) => void
  setWsOk: (ok: boolean) => void
  setSend: (fn: SendFn) => void
  reset: () => void
}

export const useWsStore = create<WsStore>((set) => ({
  serverState: null,
  wsOk: false,
  send: () => {},
  setServerState: (serverState) => set({ serverState, wsOk: true }),
  setWsOk: (wsOk) => set({ wsOk }),
  setSend: (send) => set({ send }),
  reset: () => set({ serverState: null, wsOk: false }),
}))
