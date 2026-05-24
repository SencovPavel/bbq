import type { Tab } from '../types'

function IconList({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  )
}

function IconSummary({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )
}

function IconMy({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}

function IconMembers({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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
      className="fixed bottom-0 z-50 flex w-full max-w-[500px]"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(14,12,9,0.94)',
        backdropFilter: 'blur(28px)',
        borderTop: '1px solid var(--gb)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button key={id}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center justify-center gap-[3px] py-[8px] border-none bg-transparent cursor-pointer transition-all duration-150"
            style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', fontFamily: 'inherit' }}>
            <Icon active={isActive} />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '.02em',
              transition: 'color .15s',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
