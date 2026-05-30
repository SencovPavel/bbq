import { useEffect, useRef, useCallback } from 'react'
import { useWsStore } from '../stores/wsStore'
import { useToastStore } from '../stores/toastStore'
import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { clearGroupSession } from '../lib/session'
import type { ServerState } from '../types'

export function useWebSocket(groupId: string | null, userId: string | undefined): void {
  const wsRef    = useRef<WebSocket | null>(null)
  const reconnRef = useRef<ReturnType<typeof setTimeout>>()

  const setServerState = useWsStore(s => s.setServerState)
  const setWsOk        = useWsStore(s => s.setWsOk)
  const setSend        = useWsStore(s => s.setSend)
  const showToast      = useToastStore(s => s.show)

  // Register the send function once — it reads wsRef.current at call time
  useEffect(() => {
    setSend((msg) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg))
      }
    })
  }, [setSend])

  const connect = useCallback(() => {
    if (!groupId) return
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws    = new WebSocket(`${proto}//${location.host}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      const userName = useSessionStore.getState().me?.name ?? null
      ws.send(JSON.stringify({ type: 'join', groupId, userId, userName }))
    }

    const leaveGroup = (toastMessage: string) => {
      clearGroupSession()
      useSessionStore.getState().setGroupId(null)
      useWsStore.getState().reset()
      useAppStore.getState().exitEvent()
      useAppStore.getState().setShowEventSheet(false)
      useAppStore.getState().setScreen('groups')
      showToast(toastMessage)
      ws.close()
    }

    ws.onmessage = (e: MessageEvent) => {
      let msg: { type: string; state?: ServerState; message?: string; code?: string }
      try {
        msg = JSON.parse(e.data as string) as typeof msg
      } catch {
        return
      }
      if (msg.type === 'state' && msg.state) setServerState(msg.state)
      if (msg.type === 'agent_notify' && msg.message) showToast(msg.message, 'var(--blue)')
      if (msg.type === 'error') {
        if (msg.code === 'group_not_found') {
          leaveGroup('Группа не найдена')
        } else {
          leaveGroup('Не удалось загрузить данные группы')
        }
        return
      }
      if (msg.type === 'group:deleted') {
        leaveGroup('Группа была удалена')
      }
    }

    ws.onclose = () => {
      setWsOk(false)
      reconnRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [groupId, userId, setServerState, setWsOk, showToast])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnRef.current)
      wsRef.current?.close()
    }
  }, [connect])
}
