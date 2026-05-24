import { useEffect } from 'react'
import { Blobs } from './components/Blobs'
import { TopNav } from './components/TopNav'
import { GroupBar } from './components/GroupBar'
import { Toast } from './components/Toast'
import { ListScreen } from './screens/ListScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { MyScreen } from './screens/MyScreen'
import { MembersScreen } from './screens/MembersScreen'
import { EventsScreen } from './screens/EventsScreen'
import { GroupsScreen } from './screens/GroupsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { useWebSocket } from './hooks/useWebSocket'
import { joinGroupById } from './lib/api'
import { getTgUser, getStartParam } from './lib/tg'
import { loadSession, saveSession, clearGroupSession } from './lib/session'
import { uid } from './lib/session'
import { useAppStore } from './stores/appStore'
import { useSessionStore } from './stores/sessionStore'
import { useWsStore } from './stores/wsStore'
import type { User } from './types'

// ── Module-level init (runs once before first render) ────────────────────────
const tgUser     = getTgUser()
const startParam = getStartParam()
const session    = loadSession()

const initialMe = tgUser ?? session?.me ?? null
if (initialMe) useSessionStore.getState().setMe(initialMe)
if (session?.groupId) useSessionStore.getState().setGroupId(session.groupId)
if (!startParam) {
  useAppStore.getState().setScreen(session || tgUser ? 'groups' : 'onboarding')
}
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const screen    = useAppStore(s => s.screen)
  const tab       = useAppStore(s => s.tab)
  const setScreen = useAppStore(s => s.setScreen)
  const setTab    = useAppStore(s => s.setTab)
  const currentEventId = useAppStore(s => s.currentEventId)
  const enterEvent     = useAppStore(s => s.enterEvent)
  const exitEvent      = useAppStore(s => s.exitEvent)

  const me        = useSessionStore(s => s.me)
  const groupId   = useSessionStore(s => s.groupId)
  const setMe     = useSessionStore(s => s.setMe)
  const setGroupId = useSessionStore(s => s.setGroupId)

  const serverState = useWsStore(s => s.serverState)
  const wsOk        = useWsStore(s => s.wsOk)
  const resetWs     = useWsStore(s => s.reset)

  // Connect WebSocket only when inside the app screen
  useWebSocket(screen === 'app' ? groupId : null, me?.id)

  // Handle deep link (startParam present = loading screen)
  useEffect(() => {
    if (!startParam) return
    const user: User = tgUser ?? session?.me ?? { id: uid(), name: 'Гость' }
    joinGroupById({ groupId: startParam, userId: user.id, userName: user.name })
      .then(d => {
        if (d.id) {
          setMe(user)
          setGroupId(d.id)
          saveSession(user, d.id)
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
    setScreen('app')
    setTab('events')
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
    setScreen('groups')
  }

  // Найти текущее событие по id
  const currentEvent = currentEventId
    ? serverState?.events?.find(e => e.id === currentEventId)
    : undefined

  // ── Render ────────────────────────────────────────────────────────────────

  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        <Blobs />
        <div className="text-[14px] font-bold relative z-10" style={{ color: 'var(--muted)' }}>
          Загрузка...
        </div>
      </div>
    )
  }

  if (screen === 'onboarding') {
    return (
      <div className="relative">
        <Blobs />
        <OnboardingScreen onDone={onOnboardingDone} />
        <Toast />
      </div>
    )
  }

  if (screen === 'groups') {
    return (
      <div className="relative">
        <Blobs />
        <GroupsScreen
          onEnter={enterGroup}
          onCreate={() => setScreen('onboarding')}
          onJoin={() => setScreen('onboarding')}
        />
        <Toast />
      </div>
    )
  }

  return (
    <div className="relative max-w-[500px] mx-auto min-h-screen">
      <Blobs />
      <div className="relative z-10" style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
        <GroupBar
          group={serverState?.group}
          wsOk={wsOk}
          currentEvent={currentEvent}
          onBack={backToGroups}
          onExitEvent={exitEvent}
        />

        {tab === 'events'  && <EventsScreen />}
        {tab === 'list'    && <ListScreen />}
        {tab === 'summary' && <SummaryScreen />}
        {tab === 'my'      && <MyScreen />}
        {tab === 'members' && <MembersScreen />}
      </div>
      <TopNav active={tab} onChange={setTab} />
      <Toast />
    </div>
  )
}
