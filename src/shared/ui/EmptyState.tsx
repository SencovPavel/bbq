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
    <div className="flex flex-col items-center text-center" style={{ padding: '40px 24px 24px' }}>
      <div
        className="flex items-center justify-center mb-4 shrink-0"
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: 'var(--surface-white-6)',
          border: '1px solid var(--gb)',
          color: 'var(--muted)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {icon}
      </div>
      <div className="text-lg font-black mb-1.5" style={{ letterSpacing: '-.01em' }}>{title}</div>
      {body && (
        <p
          className="text-sm leading-relaxed max-w-[260px]"
          style={{ color: 'var(--muted)', marginBottom: ctaLabel ? 18 : 0 }}
        >
          {body}
        </p>
      )}
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          className="px-[22px] py-3 rounded-md text-sm font-black border-none cursor-pointer"
          style={{
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow-brand-md)',
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
