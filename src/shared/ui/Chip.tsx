import type { ReactNode, CSSProperties } from 'react'

// ── Chip ─────────────────────────────────────────────────────────────────────
// Единая пилюля-тег на токенах брендбука (по эталону components.jsx CHIP_TINTS).

export type ChipTint = 'fire' | 'amber' | 'green' | 'red' | 'blue' | 'violet' | 'neutral'
export type ChipSize = 'sm' | 'md'

interface ChipProps {
  children: ReactNode
  tint?: ChipTint
  size?: ChipSize
  icon?: ReactNode
  className?: string
  style?: CSSProperties
}

const CHIP_TINTS: Record<ChipTint, { bg: string; border: string; color: string }> = {
  fire:    { bg: 'var(--surface-fire-12)',    border: 'var(--surface-fire-28)',    color: 'var(--accent)' },
  amber:   { bg: 'var(--surface-amber-12)',   border: 'var(--surface-amber-28)',   color: 'var(--accent-2)' },
  green:   { bg: 'var(--surface-success-13)', border: 'var(--surface-success-30)', color: 'var(--green)' },
  red:     { bg: 'var(--surface-danger-10)',  border: 'var(--surface-danger-25)',  color: 'var(--red)' },
  blue:    { bg: 'var(--surface-info-12)',    border: 'var(--surface-info-25)',    color: 'var(--blue)' },
  violet:  { bg: 'var(--surface-violet-14)',  border: 'color-mix(in srgb, var(--color-violet) 28%, transparent)', color: 'var(--color-violet)' },
  neutral: { bg: 'var(--surface-white-6)',    border: 'var(--gb)',                 color: 'var(--muted)' },
}

const SIZE_STYLE: Record<ChipSize, CSSProperties> = {
  md: { padding: '5px 12px', fontSize: 12 },
  sm: { padding: '3px 9px', fontSize: 11 },
}

export function Chip({ children, tint = 'fire', size = 'sm', icon, className = '', style = {} }: ChipProps) {
  const c = CHIP_TINTS[tint]
  return (
    <span
      className={['inline-flex items-center gap-1 rounded-pill whitespace-nowrap', className].filter(Boolean).join(' ')}
      style={{
        fontWeight: 'var(--fw-extrabold)',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        ...SIZE_STYLE[size],
        ...style,
      }}
    >
      {icon}{children}
    </span>
  )
}
