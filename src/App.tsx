import { useEffect, useState } from 'react'
import { AppLoader } from './components/AppLoader'
import { Blobs } from './components/Blobs'
import { AppShell } from './components/AppShell'
import { WebPageLayout } from './components/WebPageLayout'
import { EventSheet } from './components/EventSheet'
import { Toast } from './components/Toast'
import { ListScreen } from './screens/ListScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { MyScreen } from './screens/MyScreen'
import { EventScreen } from './screens/EventScreen'
import { GroupsScreen } from './screens/GroupsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { AuthScreen } from './screens/AuthScreen'
import { useWebSocket } from './hooks/useWebSocket'
import { joinGroupById } from './lib/api'
import { pickEventOnEntry } from './lib/events'
import { getTgUser, getStartParam, getPlatform } from './lib/tg'
import { loadSession, saveSession, clearGroupSession } from './lib/session'
import { uid } from './lib/session'
import { authDevLogin, authMe } from './lib/auth'
import { useAppStore } from './stores/appStore'
import { useSessionStore } from './stores/sessionStore'
import { useWsStore } from './stores/wsStore'
import type { User, Tab } from './types'

const TAB_ORDER: Tab[] = ['list', 'my', 'summary', 'members']

// ── Module-level init ────────────────────────────────────────────────────────
const tgUser     = getTgUser()
const startParam = getStartParam()
const session    = loadSession()

const initialMe = tgUser ?? session?.me ?? null
if (initialMe) useSessionStore.getState().setMe(initialMe)
if (session?.groupId) useSessionStore.getState().setGroupId(session.groupId)
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const screen    = useAppStore(s => s.screen)
  const tab       = useAppStore(s => s.tab)
  const setScreen = useAppStore(s => s.setScreen)
  const setTab    = useAppStore(s => s.setTab)

  const [slideDir, setSlideDir] = useState<'r' | 'l'>('r')
  const [slideKey, setSlideKey] = useState(0)

  function handleTabChange(newTab: Tab) {
    const curr = TAB_ORDER.indexOf(tab)
    const next = TAB_ORDER.indexOf(newTab)
    setSlideDir(next >= curr ? 'r' : 'l')
    setSlideKey(k => k + 1)
    setTab(newTab)
  }
  const currentEventId    = useAppStore(s => s.currentEventId)
  const enterEvent        = useAppStore(s => s.enterEvent)
  const exitEvent         = useAppStore(s => s.exitEvent)
  const hydrateGroupUi    = useAppStore(s => s.hydrateGroupUi)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const me         = useSessionStore(s => s.me)
  const groupId    = useSessionStore(s => s.groupId)
  const setMe      = useSessionStore(s => s.setMe)
  const setGroupId = useSessionStore(s => s.setGroupId)

  const serverState = useWsStore(s => s.serverState)
  const wsOk        = useWsStore(s => s.wsOk)
  const resetWs     = useWsStore(s => s.reset)

  useWebSocket(screen === 'app' ? groupId : null, me?.id)

  // Стартовая маршрутизация (без deep link)
  useEffect(() => {
    if (startParam) return

    // Web — dev-автовход или cookie-сессия
    if (getPlatform() === 'web') {
      void (async () => {
        let webUser = null

        if (import.meta.env.DEV) {
          webUser = await authDevLogin()
          if (webUser) {
            console.info('[dev] Вход как', webUser.name, `(${webUser.email})`)
          }
        }

        if (!webUser) {
          webUser = await authMe()
        }

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

    // Telegram / MAX
    setScreen(session || tgUser ? 'groups' : 'onboarding')
  }, [setScreen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isAppDataLoading = screen === 'app' && Boolean(groupId) && !serverState

  // Сброс события, если оно удалено на сервере
  useEffect(() => {
    if (screen !== 'app' || !currentEventId || !serverState?.events) return
    const exists = serverState.events.some(e => e.id === currentEventId)
    if (!exists) exitEvent()
  }, [serverState?.events, currentEventId, screen, exitEvent])

  // Автовыбор активного события когда загрузился state
  useEffect(() => {
    if (screen !== 'app' || currentEventId) return
    const pick = pickEventOnEntry(serverState?.events ?? [])
    if (pick) enterEvent(pick.id)
  }, [serverState?.events, screen, currentEventId, enterEvent])

  // Deep link
  useEffect(() => {
    if (!startParam) return
    const user: User = tgUser ?? session?.me ?? { id: uid(), name: 'Гость' }
    joinGroupById({ groupId: startParam, userId: user.id, userName: user.name })
      .then(d => {
        if (d.id) {
          setMe(user)
          setGroupId(d.id)
          saveSession(user, d.id)
          hydrateGroupUi(d.id)
          setScreen('app')
        } else {
          setScreen(tgUser || session ? 'groups' : 'onboarding')
        }
      })
      .catch(() => setScreen(tgUser || session ? 'groups' : 'onboarding'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function enterGroup(gId: string) {
    if (!me) return
    setGroupId(gId)
    saveSession(me, gId)
    resetWs()
    hydrateGroupUi(gId)
    setScreen('app')
  }

  function onOnboardingDone(user: User, gId: string) {
    setMe(user); setGroupId(gId); saveSession(user, gId); setScreen('groups')
  }

  function backToGroups() {
    clearGroupSession()
    setGroupId(null)
    resetWs()
    exitEvent()
    setShowEventSheet(false)
    setScreen('groups')
  }

  const currentEvent = currentEventId
    ? serverState?.events?.find(e => e.id === currentEventId)
    : undefined

  // ── Render ────────────────────────────────────────────────────────────────

  if (screen === 'loading' || isAppDataLoading) {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <AppLoader message={isAppDataLoading ? 'Подключаемся...' : 'Загрузка...'} />
      </div>
    )
  }

  if (screen === 'auth') {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <WebPageLayout wide>
          <AuthScreen onDone={user => { setMe(user); setScreen('groups') }} />
        </WebPageLayout>
        <Toast />
      </div>
    )
  }

  if (screen === 'onboarding') {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <WebPageLayout>
          <OnboardingScreen onDone={onOnboardingDone} />
        </WebPageLayout>
        <Toast />
      </div>
    )
  }

  if (screen === 'groups') {
    return (
      <div className="relative min-h-screen">
        <Blobs />
        <WebPageLayout wide>
          <GroupsScreen onEnter={enterGroup} onCreate={() => setScreen('onboarding')} onJoin={() => setScreen('onboarding')} />
        </WebPageLayout>
        <Toast />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <Blobs />
      <AppShell
        group={serverState?.group}
        wsOk={wsOk}
        currentEvent={currentEvent}
        tab={tab}
        slideKey={slideKey}
        slideClass={slideDir === 'r' ? 'tab-in-r' : 'tab-in-l'}
        onTabChange={handleTabChange}
        onBack={backToGroups}
      >
        {tab === 'list' && <ListScreen />}
        {tab === 'summary' && <SummaryScreen />}
        {tab === 'my' && <MyScreen />}
        {tab === 'members' && <EventScreen />}
      </AppShell>
      <EventSheet />
      <Toast />
    </div>
  )
}
