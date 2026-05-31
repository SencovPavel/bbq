import { useState } from 'react'

import { AppLoader }      from '@app/AppLoader'
import { Blobs }          from '@app/Blobs'
import { AppShell }       from '@app/AppShell'
import { WebPageLayout }  from '@app/WebPageLayout'

import { EventSheet }     from '@widgets/EventSheet'
import { Toast }          from '@shared/ui/Toast'
import { OfflineBanner }  from '@shared/ui/OfflineBanner'

import { ListScreen }      from './screens/ListScreen'
import { SummaryScreen }   from './screens/SummaryScreen'
import { MyScreen }        from './screens/MyScreen'
import { EventScreen }     from './screens/EventScreen'
import { GroupsScreen }    from './screens/GroupsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { AuthScreen }      from './screens/AuthScreen'

import { useWebSocket }    from '@shared/api/useWebSocket'
import { useBootstrap }    from '@app/useBootstrap'
import { useEventManager } from '@app/useEventManager'

import { useAppStore }     from './stores/appStore'
import { useSessionStore } from './stores/sessionStore'
import { useWsStore }      from './stores/wsStore'

import type { Tab } from '@shared/types'

const TAB_ORDER: Tab[] = ['list', 'my', 'summary', 'members']

export default function App() {
  // ── Bootstrap & event lifecycle ────────────────────────────────────────────
  const { enterGroup, onOnboardingDone, backToGroups, isAppDataLoading } = useBootstrap()
  useEventManager()

  // ── Store slices needed for render ─────────────────────────────────────────
  const screen         = useAppStore(s => s.screen)
  const tab            = useAppStore(s => s.tab)
  const setTab         = useAppStore(s => s.setTab)
  const setScreen      = useAppStore(s => s.setScreen)
  const currentEventId = useAppStore(s => s.currentEventId)

  const groupId     = useSessionStore(s => s.groupId)
  const setMe       = useSessionStore(s => s.setMe)
  const serverState = useWsStore(s => s.serverState)

  const currentEvent = currentEventId
    ? serverState?.events?.find(e => e.id === currentEventId)
    : undefined

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useWebSocket(screen === 'app' ? groupId : null)

  // ── Tab slide animation ────────────────────────────────────────────────────
  const [slideDir, setSlideDir] = useState<'r' | 'l'>('r')
  const [slideKey, setSlideKey] = useState(0)

  function handleTabChange(newTab: Tab) {
    const curr = TAB_ORDER.indexOf(tab)
    const next = TAB_ORDER.indexOf(newTab)
    setSlideDir(next >= curr ? 'r' : 'l')
    setSlideKey(k => k + 1)
    setTab(newTab)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <GroupsScreen
            onEnter={enterGroup}
            onCreate={() => setScreen('onboarding')}
            onJoin={() => setScreen('onboarding')}
          />
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
        currentEvent={currentEvent}
        tab={tab}
        slideKey={slideKey}
        slideClass={slideDir === 'r' ? 'tab-in-r' : 'tab-in-l'}
        onTabChange={handleTabChange}
        onBack={backToGroups}
      >
        {tab === 'list'    && <ListScreen />}
        {tab === 'summary' && <SummaryScreen />}
        {tab === 'my'      && <MyScreen />}
        {tab === 'members' && <EventScreen />}
      </AppShell>
      <EventSheet />
      <OfflineBanner />
      <Toast />
    </div>
  )
}
