/**
 * useBootstrap — handles all startup routing, deep-link handling,
 * and the WS connection timeout. Called once at the App root.
 *
 * Returns navigation helpers used by App.tsx render callbacks.
 */
import { useEffect } from 'react'

import { joinGroupById } from '@shared/api/api'
import { authDevLogin, authMe } from '@shared/api/auth'
import {
  getTgUser, getStartParam, getPlatform,
} from '@shared/lib/tg'
import {
  loadSession, saveSession, clearGroupSession,
} from '@shared/lib/session'

import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { useWsStore } from '../stores/wsStore'
import { useToastStore } from '../stores/toastStore'

import type { User } from '@shared/types'

// Module-level one-time reads (executed before React mounts)
const tgUser     = getTgUser()
const startParam = getStartParam()
const session    = loadSession()

/** Initialise stores synchronously before first render. */
export function initSession() {
  const initialMe = tgUser ?? session?.me ?? null
  if (initialMe) useSessionStore.getState().setMe(initialMe)
  if (session?.groupId) useSessionStore.getState().setGroupId(session.groupId)
}

export function useBootstrap() {
  const setScreen       = useAppStore(s => s.setScreen)
  const hydrateGroupUi  = useAppStore(s => s.hydrateGroupUi)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const exitEvent       = useAppStore(s => s.exitEvent)

  const setMe      = useSessionStore(s => s.setMe)
  const setGroupId = useSessionStore(s => s.setGroupId)

  const resetWs    = useWsStore(s => s.reset)
  const serverState = useWsStore(s => s.serverState)
  const showToast  = useToastStore(s => s.show)

  const screen  = useAppStore(s => s.screen)
  const groupId = useSessionStore(s => s.groupId)

  // ── Startup routing (no deep link) ──────────────────────────────────────────
  useEffect(() => {
    if (startParam) return

    if (getPlatform() === 'web') {
      void (async () => {
        let webUser = null

        if (import.meta.env.DEV) {
          webUser = await authDevLogin()
          if (webUser) console.info('[dev] Вход как', webUser.name, `(${webUser.email})`)
        }

        if (!webUser) webUser = await authMe()

        if (webUser) {
          setMe({ id: webUser.id, name: webUser.name })
          if (session?.groupId) {
            setGroupId(session.groupId)
            hydrateGroupUi(session.groupId)
            setScreen('app')
          } else {
            setScreen('groups')
          }
        } else {
          setScreen('auth')
        }
      })()
      return
    }

    setScreen(session || tgUser ? 'groups' : 'onboarding')
  }, [setScreen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Deep link ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!startParam) return
    const user: User | null = tgUser ?? session?.me ?? null
    if (!user) { setScreen('auth'); return }

    joinGroupById({ groupId: startParam })
      .then(d => {
        if (d.id) {
          setMe(user)
          setGroupId(d.id)
          saveSession(user, d.id)
          hydrateGroupUi(d.id)
          setScreen('app')
        } else {
          setScreen(tgUser || session ? 'groups' : 'auth')
        }
      })
      .catch(() => setScreen(tgUser || session ? 'groups' : 'auth'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Connection timeout ───────────────────────────────────────────────────────
  const isLoading = screen === 'app' && Boolean(groupId) && !serverState
  useEffect(() => {
    if (!isLoading) return
    const id = window.setTimeout(() => {
      showToast(
        'Не удалось подключиться. Запустите бэкенд (npm start) и выполните migrate.',
        'error',
      )
      clearGroupSession()
      setGroupId(null)
      resetWs()
      exitEvent()
      setShowEventSheet(false)
      setScreen('groups')
    }, 12_000)
    return () => clearTimeout(id)
  }, [isLoading, showToast, setGroupId, resetWs, exitEvent, setShowEventSheet, setScreen])

  // ── Navigation helpers ───────────────────────────────────────────────────────
  function enterGroup(gId: string) {
    const me = useSessionStore.getState().me
    if (!me) return
    setGroupId(gId)
    saveSession(me, gId)
    resetWs()
    hydrateGroupUi(gId)
    setScreen('app')
  }

  function onOnboardingDone(user: User, gId: string) {
    setMe(user)
    setGroupId(gId)
    saveSession(user, gId)
    setScreen('groups')
  }

  function backToGroups() {
    clearGroupSession()
    setGroupId(null)
    resetWs()
    exitEvent()
    setShowEventSheet(false)
    setScreen('groups')
  }

  return { enterGroup, onOnboardingDone, backToGroups, isAppDataLoading: isLoading }
}
