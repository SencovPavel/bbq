import type { Tab } from '../types'

const TABS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'list',    icon: '🛒', label: 'Список'    },
  { id: 'summary', icon: '💰', label: 'Итог'      },
  { id: 'my',      icon: '🙋', label: 'Моё'       },
  { id: 'members', icon: '👥', label: 'Участники' },
]

interface TopNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TopNav({ active, onChange }: TopNavProps) {
  return (
    <div className="sticky top-0 z-50 flex border-b"
      style={{ background: 'rgba(16,14,11,0.88)', backdropFilter: 'blur(24px)', borderColor: 'var(--gb)' }}>
      {TABS.map(t => (
        <button key={t.id}
          onClick={() => onChange(t.id)}
          className="flex flex-1 flex-col items-center gap-[3px] px-1 pb-[10px] pt-[12px] relative border-none bg-transparent cursor-pointer transition-colors duration-200"
          style={{ color: active === t.id ? 'var(--accent)' : 'var(--muted)', fontFamily: 'inherit' }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.03em' }}>{t.label}</span>
          {active === t.id && (
            <span className="absolute bottom-0 rounded-t-sm"
              style={{ left: '20%', right: '20%', height: 2,
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)' }} />
          )}
        </button>
      ))}
    </div>
  )
}
