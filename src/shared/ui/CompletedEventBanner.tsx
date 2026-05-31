interface CompletedEventBannerProps {
  className?: string
}

/** Плашка: событие завершено, список только для просмотра. */
export function CompletedEventBanner({ className = '' }: CompletedEventBannerProps) {
  return (
    <div
      className={`rounded-md px-3 py-2 mb-3 text-[12px] font-bold leading-snug ${className}`.trim()}
      style={{
        background: 'var(--surface-subtle)',
        border: '1px solid var(--surface-white-10)',
        color: 'var(--muted)',
      }}
    >
      Событие завершено — список и цены только для просмотра
    </div>
  )
}
