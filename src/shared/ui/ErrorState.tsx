import { IconAlertCircle, IconRefresh } from './Icon'

interface ErrorStateProps {
  title?: string
  body?: string
  onRetry: () => void
}

export function ErrorState({
  title = 'Не удалось загрузить',
  body = 'Проверьте соединение и попробуйте снова',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center text-center" style={{ padding: '40px 24px 24px' }}>
      <div
        className="flex items-center justify-center mb-4 shrink-0"
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: 'var(--surface-danger-8)',
          border: '1px solid var(--surface-danger-25)',
          color: 'var(--red)',
        }}
      >
        <IconAlertCircle size={32} strokeWidth={1.8} />
      </div>
      <div className="text-lg font-black mb-1.5" style={{ letterSpacing: '-.01em' }}>{title}</div>
      <p className="text-sm leading-relaxed mb-[18px] max-w-[260px]" style={{ color: 'var(--muted)' }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md text-sm font-extrabold border-none cursor-pointer"
        style={{
          padding: '12px 22px',
          background: 'var(--surface-danger-10)',
          border: '1px solid var(--surface-danger-30)',
          color: 'var(--red)',
          fontFamily: 'inherit',
        }}
      >
        <IconRefresh size={13} strokeWidth={2.4} />
        Повторить
      </button>
    </div>
  )
}
