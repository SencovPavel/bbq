interface CatTileProps {
  emoji?: string   // category.icon (emoji string)
  size?: number    // 36 — list, 26 — summary, 34 — picker
  radius?: number  // 10 — list/picker, 7 — summary
}

export function CatTile({ emoji = '📦', size = 36, radius = 10 }: CatTileProps) {
  return (
    <div
      className="flex items-center justify-center shrink-0 leading-none"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'var(--surface-cream-6)',
        border: '1px solid var(--gbs)',
        fontSize: Math.round(size * 0.5),
      }}
      aria-hidden
    >
      {emoji}
    </div>
  )
}
