export function OfflineBanner() {
  return (
    <div
      className="mb-3 px-3 py-2.5 rounded-md text-xs font-bold text-center"
      style={{
        background: 'rgba(251,191,36,.1)',
        border: '1px solid rgba(251,191,36,.25)',
        color: 'var(--accent-2)',
      }}
    >
      Нет связи. Можно отмечать купленное — синхронизируем позже
    </div>
  )
}
