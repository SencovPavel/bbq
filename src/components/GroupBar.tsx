import { useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { IconCheck } from './Icon'
import type { Group, PicnicEvent } from '../types'

interface GroupBarProps {
  group: Group | undefined
  wsOk: boolean
  currentEvent: PicnicEvent | undefined
  onBack: () => void
}

export function GroupBar({ group, currentEvent, onBack }: GroupBarProps) {
  const [copied, setCopied] = useState(false)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  function copyCode() {
    if (!group?.invite_code) return
    navigator.clipboard?.writeText(group.invite_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">

      {/* ← назад к группам */}
      <button onClick={onBack}
        className="flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-opacity duration-150 active:opacity-60"
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,240,200,0.08)',
          border: '1px solid rgba(255,220,150,0.12)',
          color: 'var(--text)',
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Event pill — нажимаешь → шторка */}
      <button
        onClick={() => setShowEventSheet(true)}
        className="flex items-center gap-[5px] flex-shrink-0 border-none cursor-pointer rounded-full transition-all duration-150 active:opacity-70"
        style={{
          padding: '6px 10px 6px 9px',
          background: currentEvent ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${currentEvent ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.12)'}`,
          color: currentEvent ? 'var(--accent)' : 'var(--muted)',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          maxWidth: 160,
        }}>
        {/* calendar icon */}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentEvent ? currentEvent.name : 'Событие'}
        </span>
        {/* chevron down */}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Название группы */}
      <div className="flex-1 min-w-0 truncate"
        style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
        {group?.name || '…'}
      </div>

      {/* Код приглашения */}
      <button onClick={copyCode}
        className="flex items-center gap-[5px] flex-shrink-0 border-none cursor-pointer rounded-full transition-all duration-200 active:opacity-70"
        style={{
          padding: '6px 10px',
          background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.1)',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.22)'}`,
          color: copied ? 'var(--green)' : '#FBBF24',
          fontSize: 12, fontWeight: 700, letterSpacing: '.05em', fontFamily: 'inherit',
        }}>
        {copied ? <IconCheck size={13} strokeWidth={2.5} /> : (
          <>
            {group?.invite_code || '—'}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </>
        )}
      </button>

    </div>
  )
}
