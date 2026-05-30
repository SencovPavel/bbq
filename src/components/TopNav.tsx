import { NAV_TABS, NAV_TAB_COUNT } from '../config/nav-tabs'

import type { Tab } from '../types'

interface TopNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const NAV_PADDING_PX = 4

export function TopNav({ active, onChange }: TopNavProps) {
  const activeIndex = NAV_TABS.findIndex((tab) => tab.id === active)

  return (
    <div
      className="fixed z-50 lg:hidden"
      style={{
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 310,
      }}
    >
      <div
        className="relative flex items-center rounded-[22px] p-[4px]"
        style={{
          background: 'rgba(22,18,13,0.88)',
          backdropFilter: 'blur(32px)',
          border: '1px solid var(--card-b)',
          boxShadow: '0 4px 24px var(--surface-scrim-light)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[18px]"
          style={{
            top: NAV_PADDING_PX,
            bottom: NAV_PADDING_PX,
            left: NAV_PADDING_PX,
            width: `calc((100% - ${NAV_PADDING_PX * 2}px) / ${NAV_TAB_COUNT})`,
            transform: `translateX(${activeIndex * 100}%)`,
            transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'var(--surface-fire-14)',
            boxShadow: '0 0 0 1px var(--surface-fire-22)',
          }}
        />

        {NAV_TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-[2px] rounded-[18px] border-none bg-transparent py-[7px] cursor-pointer transition-colors duration-200"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'inherit',
              }}
            >
              <Icon active={isActive} />
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '.02em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
