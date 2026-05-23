import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function GlassCard({ children, className = '', style = {} }: GlassCardProps) {
  return (
    <div className={`rounded-[20px] overflow-hidden mb-[10px] glass ${className}`} style={style}>
      {children}
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--gb)' }} />
}
