import { useState } from 'react'
import type { ActivityEntry } from '@shared/types'

// ── icons ─────────────────────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  'member:joined':   '👤',
  'item:added':      '➕',
  'item:bought':     '✅',
  'item:deleted':    '🗑️',
  'event:created':   '🗓️',
  'event:completed': '✔️',
  'agent:added':     '🤖',
}

// ── description ───────────────────────────────────────────────────────────────

function describe(entry: ActivityEntry): string {
  const d    = entry.data as Record<string, string | number>
  const name = entry.actor_name ?? 'Кто-то'

  switch (entry.type) {
    case 'member:joined':
      return `${name} вступил в группу`
    case 'item:added':
      return `${name} добавил «${d.name}»`
    case 'item:bought':
      return `${name} купил «${d.name}»`
    case 'item:deleted':
      return d.buyerName
        ? `${name} удалил «${d.name}» (было у ${d.buyerName})`
        : `${name} удалил «${d.name}»`
    case 'event:created':
      return `${name} создал событие «${d.name}»`
    case 'event:completed':
      return `${name} завершил событие «${d.name}»`
    case 'agent:added':
      return `Агент добавил ${d.count} поз. из чата`
    default:
      return `${name}: ${entry.type}`
  }
}

// ── timestamp ─────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  if (min < 1)   return 'только что'
  if (min < 60)  return `${min} мин. назад`
  const h = Math.floor(min / 60)
  if (h  < 24)   return `${h} ч. назад`
  const d = Math.floor(h / 24)
  if (d  < 7)    return `${d} дн. назад`
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props { activity: ActivityEntry[] }

export function ActivityFeed({ activity }: Props) {
  const [open, setOpen] = useState(false)

  if (!activity.length) return null

  return (
    <div className="mb-3">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-[15px] py-[11px] rounded-[14px] border-none cursor-pointer"
        style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--surface-white-8)',
          fontFamily: 'inherit',
        }}
      >
        <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          История · {activity.length}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Feed */}
      {open && (
        <div
          className="mt-2 rounded-[14px] overflow-hidden"
          style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-white-6)' }}
        >
          {activity.slice(0, 40).map(e => (
            <div
              key={e.id}
              className="flex items-start gap-3 px-[14px] py-[9px] border-b last:border-none"
              style={{ borderColor: 'var(--surface-subtle)' }}
            >
              <span className="text-[15px] flex-shrink-0 mt-[2px] leading-none">
                {ICONS[e.type] ?? '•'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] leading-snug" style={{ color: 'var(--text)' }}>
                  {describe(e)}
                </div>
                <div className="text-[10px] mt-[3px]" style={{ color: 'var(--muted)', opacity: 0.55 }}>
                  {relTime(e.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
