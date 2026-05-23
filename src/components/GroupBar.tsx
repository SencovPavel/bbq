import { useState } from 'react'
import type { Group } from '../types'

interface GroupBarProps {
  group: Group | undefined
  wsOk: boolean
  onBack: () => void
}

export function GroupBar({ group, wsOk, onBack }: GroupBarProps) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!group?.invite_code) return
    navigator.clipboard?.writeText(group.invite_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <button onClick={onBack}
        className="text-xl leading-none border-none bg-transparent cursor-pointer p-0"
        title="К списку групп">
        🔥
      </button>
      <div className="flex-1 min-w-0 text-center">
        <div className="text-sm font-extrabold truncate" style={{ color: 'var(--text)' }}>
          {group?.name || '…'}
        </div>
        <button onClick={copyCode}
          className="inline-flex items-center gap-1 rounded-full px-3 py-[3px] text-[11px] font-bold cursor-pointer border-none mt-[3px]"
          style={{ background: 'var(--g)', border: '1px solid var(--gb)', color: 'var(--muted)' }}>
          Код: <b style={{ color: 'var(--accent2)', letterSpacing: '.06em' }}>
            {copied ? '✓ скопировано' : (group?.invite_code || '—')}
          </b>
        </button>
      </div>
      <div className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: wsOk ? 'var(--green)' : 'var(--muted)',
          boxShadow:  wsOk ? '0 0 8px var(--green)' : 'none',
          transition: 'background .4s',
        }} />
    </div>
  )
}
