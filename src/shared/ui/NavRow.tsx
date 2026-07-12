import type { ReactNode } from 'react'

interface NavRowProps {
  icon: ReactNode
  iconBg: string
  iconColor: string
  title: string
  meta?: string
  soon?: boolean
  trailing?: ReactNode
  onClick?: () => void
}

export function NavRow({ icon, iconBg, iconColor, title, meta, soon, trailing, onClick }: NavRowProps) {
  const disabled = !onClick
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-[13px] px-[15px] py-[13px] bg-transparent border-none text-left"
      style={{ cursor: disabled ? 'default' : 'pointer', opacity: disabled && !soon ? .55 : 1, fontFamily: 'inherit' }}
    >
      <div
        className="size-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-extrabold">{title}</div>
        {meta && (
          <div className="text-[11.5px] font-semibold mt-px" style={{ color: 'var(--muted)' }}>{meta}</div>
        )}
      </div>
      {trailing ?? (soon ? (
        <span
          className="text-[10px] font-extrabold uppercase rounded-pill px-2 py-[3px] flex-shrink-0"
          style={{
            color: 'var(--muted)',
            background: 'rgba(255,255,255,.05)',
            border: '1px solid var(--gb)',
            letterSpacing: '.08em',
          }}
        >
          Скоро
        </span>
      ) : (
        <span className="flex-shrink-0 text-[18px]" style={{ color: 'var(--muted)' }}>›</span>
      ))}
    </button>
  )
}
