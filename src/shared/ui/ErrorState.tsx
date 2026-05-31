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
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="text-lg font-extrabold mb-2">{title}</div>
      <p className="text-sm mb-6 max-w-[260px]" style={{ color: 'var(--muted)' }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 rounded-md text-sm font-extrabold border-none cursor-pointer btn-glass"
        style={{ fontFamily: 'inherit' }}
      >
        Повторить
      </button>
    </div>
  )
}
