import { useEffect, useState } from 'react'

import { useWsStore } from '../../stores/wsStore'

const EXPANDED_MS = 2800
const LEAVE_MS = 280

const FULL_MESSAGE = 'Нет связи. Покупки можно отмечать — синхронизируем позже'
const SHORT_MESSAGE = 'Нет связи'

type OfflinePhase = 'hidden' | 'expanded' | 'compact' | 'leaving'

const buildOfflineClassName = (compact: boolean, leaving: boolean): string => {
  const parts = ['floating-overlay', 'floating-overlay--offline']
  if (compact) parts.push('floating-overlay--compact')
  if (leaving) parts.push('floating-overlay--leaving')
  return parts.join(' ')
}

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
  const dotClassName = [
    'floating-overlay__dot',
    'floating-overlay__dot--offline',
    compact && !leaving ? 'offline-banner__dot--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={FULL_MESSAGE}
      className={buildOfflineClassName(compact, leaving)}
    >
      <span className={dotClassName} aria-hidden />
      <span className="floating-overlay__message">
        {compact ? SHORT_MESSAGE : FULL_MESSAGE}
      </span>
    </div>
  )
}
