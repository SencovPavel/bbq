import { GroupBar } from './GroupBar'
import { TopNav } from './TopNav'
import { AppSidebar } from './AppSidebar'

import type { Group, PicnicEvent, Tab } from '../types'
import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  group: Group | undefined
  wsOk: boolean
  currentEvent: PicnicEvent | undefined
  tab: Tab
  slideKey: number
  slideClass: string
  onTabChange: (tab: Tab) => void
  onBack: () => void
}

export function AppShell({
  children,
  group,
  wsOk,
  currentEvent,
  tab,
  slideKey,
  slideClass,
  onTabChange,
  onBack,
}: AppShellProps) {
  return (
    <div className="app-shell relative min-h-screen">
      <AppSidebar
        group={group}
        currentEvent={currentEvent}
        activeTab={tab}
        onTabChange={onTabChange}
        onBack={onBack}
      />

      <div className="app-shell__main">
        <header className="app-shell__header lg:hidden">
          <GroupBar
            group={group}
            currentEvent={currentEvent}
            onBack={onBack}
          />
        </header>

        <div className="app-shell__content">
          <div key={slideKey} className={slideClass} style={{ overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <TopNav active={tab} onChange={onTabChange} />
      </div>
    </div>
  )
}
