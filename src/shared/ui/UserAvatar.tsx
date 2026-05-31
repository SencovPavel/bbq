interface UserAvatarProps {
  name: string
  size?: number
  isAdmin?: boolean
}

export function UserAvatar({ name, size = 36, isAdmin = false }: UserAvatarProps) {
  const letter = (name || '?').charAt(0).toUpperCase()

  return (
    <div
      className="flex items-center justify-center rounded-full font-extrabold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: isAdmin
          ? 'var(--gradient-avatar-admin)'
          : 'linear-gradient(135deg, var(--surface-fire-22), var(--surface-amber-12))',
        border: isAdmin ? '1px solid var(--surface-amber-40)' : '1px solid var(--gbs)',
        color: isAdmin ? 'var(--accent-2)' : 'var(--accent)',
      }}
      aria-hidden
    >
      {letter}
    </div>
  )
}
