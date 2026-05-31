import { NAV_TABS } from '@shared/config/nav-tabs'
import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { useWsStore } from '../stores/wsStore'
import { IconFlame } from '@shared/ui/Icon'

import type { Group, PicnicEvent, Tab } from '@shared/types'

interface AppSidebarProps {
  group: Group | undefined
  currentEvent: PicnicEvent | undefined
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onBack: () => void
}

const shortDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function AppSidebar({
  group,
  currentEvent,
  activeTab,
  onTabChange,
  onBack,
}: AppSidebarProps) {
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const events     = useWsStore(s => s.serverState?.events ?? [])
  const me         = useSessionStore(s => s.me)
  const members    = useWsStore(s => s.serverState?.members ?? [])
  const hasEvents  = events.length > 0
  const isAdmin    = members.some(m => m.user_id === me?.id && m.is_admin)

  const eventLabel = currentEvent
    ? currentEvent.name + (currentEvent.event_date ? ` · ${shortDate(currentEvent.event_date)}` : '')
    : !hasEvents && isAdmin
      ? 'Создать событие'
      : 'Выбрать событие'

  return (
    <aside className="app-sidebar hidden lg:flex">
      {/* Brand */}
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo" aria-hidden>
          <IconFlame size={22} strokeWidth={1.4} />
        </div>
        <div>
          <div className="app-sidebar__title">Котёл</div>
          <div className="app-sidebar__subtitle">Совместные закупки</div>
        </div>
      </div>

      {/* Nav — вверху */}
      <nav className="app-sidebar__nav" aria-label="Разделы">
        {NAV_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              className={`app-sidebar__nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => onTabChange(id)}
            >
              <Icon active={isActive} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Group info — прилипает к низу */}
      <div className="app-sidebar__footer">
        <div className="app-sidebar__group">
          <div className="app-sidebar__group-name">{group?.name || 'Группа'}</div>
          <button
            type="button"
            className="app-sidebar__event"
            onClick={() => setShowEventSheet(true)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{eventLabel}</span>
          </button>
        </div>

        <button type="button" className="app-sidebar__back" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Все группы
        </button>
      </div>
    </aside>
  )
}
