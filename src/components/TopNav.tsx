import type { Tab } from '../types'

function IconEvents({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <circle cx="8"  cy="15" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function IconSummary({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )
}

function IconMy({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function IconMembers({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2"/>
      <path d="M2 20c0-3.3 3-5.8 7-5.8s7 2.5 7 5.8"/>
      <circle cx="17.5" cy="8.5" r="2.5"/>
      <path d="M22 20c0-2.6-2-4.7-4.5-5.2"/>
    </svg>
  )
}

const TABS: Array<{ id: Tab; label: string; Icon: React.FC<{ active: boolean }> }> = [
  { id: 'list',    label: 'Список',    Icon: IconList    },
  { id: 'summary', label: 'Итог',      Icon: IconSummary },
  { id: 'my',      label: 'Моё',       Icon: IconMy      },
  { id: 'members', label: 'Участники', Icon: IconMembers },
]

interface TopNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TopNav({ active, onChange }: TopNavProps) {
  return (
    <div
      className="fixed z-50"
      style={{
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 310,
      }}
    >
      <div
        className="flex items-center rounded-[22px] p-[4px]"
        style={{
          background: 'rgba(22,18,13,0.88)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,220,150,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button key={id}
              onClick={() => onChange(id)}
              className="flex flex-1 flex-col items-center justify-center gap-[2px] py-[7px] rounded-[18px] border-none cursor-pointer transition-all duration-200"
              style={{
                background: isActive ? 'rgba(249,115,22,0.13)' : 'transparent',
                color:      isActive ? 'var(--accent)' : 'rgba(245,240,234,0.38)',
                fontFamily: 'inherit',
                boxShadow:  isActive ? '0 0 0 1px rgba(249,115,22,0.22)' : 'none',
              }}>
              <Icon active={isActive} />
              <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, letterSpacing: '.02em', lineHeight: 1 }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
