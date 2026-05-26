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
          ? 'linear-gradient(135deg, rgba(251,191,36,.35), rgba(249,115,22,.2))'
          : 'linear-gradient(135deg, rgba(249,115,22,.22), rgba(251,191,36,.12))',
        border: isAdmin ? '1px solid rgba(251,191,36,.4)' : '1px solid var(--gbs)',
        color: isAdmin ? 'var(--accent-2)' : 'var(--accent)',
      }}
      aria-hidden
    >
      {letter}
    </div>
  )
}
