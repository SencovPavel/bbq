import { useState } from 'react'

import { NAV_TABS, NAV_TAB_COUNT } from '../config/nav-tabs'
import { useAppStore } from '../stores/appStore'
import { IconCheck, IconFlame } from './Icon'

import type { Group, PicnicEvent, Tab } from '../types'

interface AppSidebarProps {
  group: Group | undefined
  wsOk: boolean
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
  wsOk,
  currentEvent,
  activeTab,
  onTabChange,
  onBack,
}: AppSidebarProps) {
  const [copied, setCopied] = useState(false)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const activeIndex = Math.max(0, NAV_TABS.findIndex(t => t.id === activeTab))

  const eventLabel = currentEvent
    ? currentEvent.name + (currentEvent.event_date ? ` · ${shortDate(currentEvent.event_date)}` : '')
    : 'Выбрать событие'

  const copyCode = () => {
    if (!group?.invite_code) return
    navigator.clipboard?.writeText(group.invite_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <aside className="app-sidebar hidden lg:flex">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo" aria-hidden>
          <IconFlame size={22} strokeWidth={1.4} />
        </div>
        <div>
          <div className="app-sidebar__title">Котёл</div>
          <div className="app-sidebar__subtitle">Совместные закупки</div>
        </div>
      </div>

      <button type="button" className="app-sidebar__back" onClick={onBack}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Все группы
      </button>

      <div className="app-sidebar__group cloud-panel">
        <div className="app-sidebar__group-name">{group?.name || 'Группа'}</div>
        <div className="app-sidebar__meta">
          <span
            className="app-sidebar__status"
            style={{ color: wsOk ? 'var(--green)' : 'var(--muted)' }}
          >
            {wsOk ? '● Онлайн' : '○ Подключение…'}
          </span>
          <button type="button" className="app-sidebar__code" onClick={copyCode}>
            {copied ? <IconCheck size={13} strokeWidth={2.5} /> : group?.invite_code || '—'}
          </button>
        </div>
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

      <nav
        className="app-sidebar__nav"
        aria-label="Разделы"
        style={{
          ['--nav-tab-count' as string]: NAV_TAB_COUNT,
          ['--nav-active-index' as string]: activeIndex,
        }}
      >
        <div aria-hidden className="app-sidebar__nav-indicator" />
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
    </aside>
  )
}
