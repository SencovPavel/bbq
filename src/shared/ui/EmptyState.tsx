import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  body?: string
  ctaLabel?: string
  onCta?: () => void
}

export function EmptyState({ icon, title, body, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="mb-4 opacity-40" style={{ color: 'var(--muted)' }}>
        {icon}
      </div>
      <div className="text-lg font-extrabold mb-2 tracking-tight">{title}</div>
      {body && (
        <p className="text-sm leading-relaxed max-w-[260px] mb-6" style={{ color: 'var(--muted)' }}>
          {body}
        </p>
      )}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="px-6 py-3 rounded-md text-sm font-extrabold border-none cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
