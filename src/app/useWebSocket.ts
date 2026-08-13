import { useEffect, useRef, useCallback } from 'react'

import { getTelegramInitData } from '@shared/lib/tg'
import { clearGroupSession } from '@shared/lib/session'
import { useWsStore } from '@stores/wsStore'
import { useToastStore } from '@stores/toastStore'
import { useAppStore } from '@stores/appStore'
import { useSessionStore } from '@stores/sessionStore'

import type { ServerState } from '@shared/types'

export function useWebSocket(groupId: string | null): void {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnRef = useRef<ReturnType<typeof setTimeout>>()

  const setServerState = useWsStore(s => s.setServerState)
  const setWsOk = useWsStore(s => s.setWsOk)
  const setLoadError = useWsStore(s => s.setLoadError)
  const retryNonce = useWsStore(s => s.retryNonce)
  const setSend = useWsStore(s => s.setSend)
  const showToast = useToastStore(s => s.show)

  useEffect(() => {
    setSend((msg) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg))
        return true
      }
      return false
    })
  }, [setSend])

  const connect = useCallback(function connectWs() {
    if (!groupId) return
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${location.host}/ws`)
    wsRef.current = ws

    ws.onopen = () => {
      const initData = getTelegramInitData()
      const payload: { type: 'join'; groupId: string; initData?: string } = {
        type: 'join',
        groupId,
      }
      if (initData) payload.initData = initData
      ws.send(JSON.stringify(payload))
    }

    const leaveGroup = (toastMessage: string, screen: 'groups' | 'auth' = 'groups') => {
      clearGroupSession()
      useSessionStore.getState().setGroupId(null)
      useWsStore.getState().reset()
      useAppStore.getState().exitEvent()
      useAppStore.getState().setShowEventSheet(false)
      useAppStore.getState().setScreen(screen)
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
      if (msg.type === 'state' && msg.state) {
        setServerState(msg.state)
        setWsOk(true)
      }
      if (msg.type === 'agent_notify' && msg.message) showToast(msg.message, 'info')
      if (msg.type === 'error') {
        if (msg.code === 'forbidden') {
          showToast('Недостаточно прав для этого действия', 'error')
          return
        }
        if (msg.code === 'auth_required') {
          leaveGroup('Войдите в аккаунт или откройте приложение в Telegram', 'auth')
          return
        }
        if (msg.code === 'not_member') {
          leaveGroup('Вы не состоите в этой группе')
          return
        }
        if (msg.code === 'group_not_found') {
          leaveGroup('Группа не найдена')
          return
        }
        leaveGroup('Не удалось загрузить данные группы')
        return
      }
      if (msg.type === 'group:deleted') {
        leaveGroup('Группа была удалена')
      }
    }

    ws.onclose = () => {
      setWsOk(false)
      // Если начальная загрузка так и не прошла — показываем состояние ошибки
      if (!useWsStore.getState().serverState) setLoadError(true)
      reconnRef.current = setTimeout(connectWs, 3000)
    }

    ws.onerror = () => ws.close()
  }, [groupId, setServerState, setWsOk, setLoadError, showToast])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnRef.current)
      wsRef.current?.close()
    }
    // retryNonce в зависимостях: ручной «Повторить» пересоздаёт соединение
  }, [connect, retryNonce])
}
