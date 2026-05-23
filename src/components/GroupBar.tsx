import { useState } from 'react'
import type { Group } from '../types'

interface GroupBarProps {
  group: Group | undefined
  wsOk: boolean
  onBack: () => void
}

export function GroupBar({ group, onBack }: GroupBarProps) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!group?.invite_code) return
    navigator.clipboard?.writeText(group.invite_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">

      {/* ← Назад */}
      <button onClick={onBack}
        className="flex items-center gap-1 border-none bg-transparent cursor-pointer p-0 flex-shrink-0"
        style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
        Назад
      </button>

      {/* Название группы */}
      <div className="flex-1 min-w-0 text-center font-extrabold truncate"
        style={{ fontSize: 15, color: 'var(--text)' }}>
        {group?.name || '…'}
      </div>

      {/* Код · тап → скопировать */}
      <button onClick={copyCode}
        className="flex items-center gap-1 flex-shrink-0 border-none bg-transparent cursor-pointer p-0"
        style={{ color: copied ? 'var(--green)' : 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
        {copied
          ? '✓ скопировано'
          : <><b style={{ color: 'var(--accent2)', letterSpacing: '.05em' }}>{group?.invite_code || '—'}</b> 📋</>
        }
      </button>

    </div>
  )
}
