interface AppLoaderProps {
  message?: string
}

export function AppLoader({ message = 'Загрузка...' }: AppLoaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-4 relative z-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="app-loader-ring" aria-hidden />
      <div className="text-[14px] font-bold" style={{ color: 'var(--muted)' }}>
        {message}
      </div>
    </div>
  )
}
