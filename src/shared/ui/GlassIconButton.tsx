import type { ReactNode } from 'react'
import { IconChevronLeft } from './Icon'

// ── GlassIconButton ───────────────────────────────────────────────────────────
// Единый «навигационный control» по Apple HIG: круглая, полупрозрачная,
// с backdrop-blur. Эталон взят из GroupBar.

interface GlassIconButtonProps {
  children: ReactNode
  onClick?: () => void
  title?: string
  ariaLabel?: string
  size?: number        // диаметр кнопки, по умолчанию 36
  accent?: boolean     // акцентный (оранжевый) вариант — для «действий», не для «назад»
  className?: string
}

export function GlassIconButton({
  children,
  onClick,
  title,
  ariaLabel,
  size = 36,
  accent = false,
  className = '',
}: GlassIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      style={{ width: size, height: size }}
      className={[
        'relative tap-target rounded-full flex items-center justify-center shrink-0 cursor-pointer',
        'border active:scale-95 transition',
        'backdrop-blur-md backdrop-saturate-150',
        accent
          ? 'bg-[rgba(249,115,22,0.12)] border-[rgba(249,115,22,0.30)] text-[var(--accent)]'
          : 'bg-[var(--surface-cream-8)] border-[var(--card-b)] text-[var(--text)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  )
}

// ── BackButton ────────────────────────────────────────────────────────────────
// Тонкая обёртка: GlassIconButton + шеврон. Используется в шапках экранов.

interface BackButtonProps {
  onClick?: () => void
  title?: string
}

export function BackButton({ onClick, title = 'Назад' }: BackButtonProps) {
  return (
    <GlassIconButton onClick={onClick} title={title} ariaLabel={title}>
      <IconChevronLeft size={15} />
    </GlassIconButton>
  )
}
