import type { ReactNode } from 'react'
import { IconFlame } from './Icon'

// ── Пресеты размеров ──────────────────────────────────────────────────────────

type LockupSize = 'sm' | 'md' | 'lg'

const SIZES: Record<LockupSize, { icon: number; stroke: number; text: number; gap: number }> = {
  sm: { icon: 20, stroke: 1.5, text: 18, gap: 8 },  // компактные шапки / витрина
  md: { icon: 22, stroke: 1.4, text: 22, gap: 10 }, // экранные шапки (Группы)
  lg: { icon: 28, stroke: 1.4, text: 30, gap: 10 }, // онбординг / сплэш
}

interface BrandLockupProps {
  size?: LockupSize
  /** false → вордмарк цвета var(--text), для тёмных плашек (десктоп-сайдбар) */
  accent?: boolean
  /** Подпись под вордмарком (опц., используется в сайдбаре) */
  subtitle?: string
  /** Обернуть вордмарк в семантический тег (h1 для сплэша/онбординга) */
  as?: 'span' | 'h1' | 'h2'
}

export function BrandLockup({
  size = 'md',
  accent = true,
  subtitle,
  as: Tag = 'span',
}: BrandLockupProps) {
  const s = SIZES[size]

  const wordmark = (
    <Tag
      className="font-black"
      style={{
        fontSize:      s.text,
        letterSpacing: '-.02em',
        color:         accent ? 'var(--accent)' : 'var(--text)',
        lineHeight:    1,
        margin:        0,
      }}
    >
      Котёл
    </Tag>
  )

  return (
    <div className="flex items-center" style={{ gap: s.gap }}>
      {/* Иконка всегда var(--accent), независимо от accent-пропа вордмарка */}
      <span style={{ color: 'var(--accent)', display: 'flex' }} aria-hidden="true">
        <IconFlame size={s.icon} strokeWidth={s.stroke} />
      </span>

      <div>
        {wordmark}
        {subtitle && (
          <div className="text-[11px] font-semibold mt-px" style={{ color: 'var(--muted)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
