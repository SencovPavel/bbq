import { useEffect, useState } from 'react'

import { useWsStore } from '../../stores/wsStore'

const EXPANDED_MS = 2800
const LEAVE_MS = 280

const FULL_MESSAGE = 'Нет связи. Можно отмечать купленное — синхронизируем позже'
const SHORT_MESSAGE = 'Нет связи'

type OfflinePhase = 'hidden' | 'expanded' | 'compact' | 'leaving'

/**
 * Плавающий индикатор офлайна: сначала полное сообщение сверху (как тост),
 * затем сжимается в компактную плашку по центру — без сдвига layout.
 */
export function OfflineBanner() {
  const wsOk = useWsStore((s) => s.wsOk)
  const [phase, setPhase] = useState<OfflinePhase>('hidden')

  useEffect(() => {
    if (!wsOk) {
      setPhase('expanded')
      const compactTimer = window.setTimeout(() => {
        setPhase((current) => (current === 'expanded' ? 'compact' : current))
      }, EXPANDED_MS)
      return () => window.clearTimeout(compactTimer)
    }

    setPhase((current) => (current === 'hidden' ? 'hidden' : 'leaving'))
  }, [wsOk])

  useEffect(() => {
    if (phase !== 'leaving') return
    const hideTimer = window.setTimeout(() => setPhase('hidden'), LEAVE_MS)
    return () => window.clearTimeout(hideTimer)
  }, [phase])

  if (phase === 'hidden') return null

  const compact = phase === 'compact' || phase === 'leaving'
  const leaving = phase === 'leaving'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={FULL_MESSAGE}
      className="fixed z-[290] left-1/2 flex items-center gap-2 overflow-hidden rounded-[var(--r-md)] font-semibold leading-snug"
      style={{
        top: 'max(12px, env(safe-area-inset-top, 0px))',
        maxWidth: compact ? 124 : 'min(92vw, 360px)',
        padding: compact ? '6px 12px' : '10px 14px',
        fontSize: compact ? 12 : 13,
        transform: leaving
          ? 'translateX(-50%) translateY(-10px) scale(0.96)'
          : 'translateX(-50%) translateY(0) scale(1)',
        opacity: leaving ? 0 : 1,
        background: 'rgba(16, 14, 11, 0.92)',
        border: '1px solid rgba(251, 191, 36, 0.28)',
        color: 'var(--text)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        pointerEvents: 'none',
        transition:
          'max-width 0.45s ease, padding 0.45s ease, font-size 0.35s ease, transform 0.28s ease, opacity 0.28s ease',
      }}
    >
      <span
        className={`shrink-0 rounded-full${compact && !leaving ? ' offline-banner__dot--pulse' : ''}`}
        style={{
          width: 6,
          height: 6,
          background: 'var(--accent-2)',
        }}
        aria-hidden
      />
      <span className="whitespace-nowrap min-w-0">
        {compact ? SHORT_MESSAGE : FULL_MESSAGE}
      </span>
    </div>
  )
}
