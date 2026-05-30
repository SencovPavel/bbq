import { useAppStore } from '../stores/appStore'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { dateTileMonth } from '../lib/format'
import { IconCalendar, IconChevronDown, IconChevronLeft } from './Icon'

import type { Group, PicnicEvent } from '../types'

interface GroupBarProps {
  group: Group | undefined
  currentEvent: PicnicEvent | undefined
  onBack: () => void
}

function DateTile({ event }: { event: PicnicEvent | undefined }) {
  if (!event?.event_date) {
    return (
      <div className="size-7 rounded-sm bg-white/5 text-muted flex items-center justify-center shrink-0">
        <IconCalendar size={14} />
      </div>
    )
  }

  const d = new Date(event.event_date + 'T00:00:00')

  return (
    <div
      className="size-7 rounded-sm shrink-0 flex flex-col items-center justify-center tabular-nums"
      style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,.32), rgba(251,191,36,.14))',
        color: 'var(--accent)',
      }}
    >
      <div className="text-[12px] font-extrabold leading-none">{d.getDate()}</div>
      <div className="text-[7px] font-extrabold uppercase tracking-wide opacity-80 mt-px">
        {dateTileMonth(event.event_date)}
      </div>
    </div>
  )
}

export function GroupBar({ group, currentEvent, onBack }: GroupBarProps) {
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const me                = useSessionStore(s => s.me)
  const events            = useWsStore(s => s.serverState?.events ?? [])
  const members           = useWsStore(s => s.serverState?.members ?? [])
  const hasEvents         = events.length > 0
  const isAdmin           = members.some(m => m.user_id === me?.id && m.is_admin)
  const eventLabel        = currentEvent
    ? currentEvent.name
    : !hasEvents && isAdmin
      ? 'Создать событие'
      : 'Выбрать событие'

  return (
    <div
      className="flex items-center gap-2 px-3.5 pt-[max(12px,env(safe-area-inset-top))] pb-2.5
                 bg-[rgba(16,14,11,0.78)] backdrop-blur-xl backdrop-saturate-150
                 border-b border-[rgba(255,220,150,0.06)]"
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Все группы"
        className="size-9 rounded-full flex items-center justify-center shrink-0
                   bg-[rgba(255,240,200,0.08)] border border-[rgba(255,220,150,0.12)]
                   text-[var(--text)] active:scale-95 transition border-none cursor-pointer"
      >
        <IconChevronLeft size={15} />
      </button>

      <button
        type="button"
        onClick={() => setShowEventSheet(true)}
        className={`flex-1 min-w-0 h-11 px-3 rounded-md flex items-center gap-2.5
                    cursor-pointer text-left transition border
                    ${currentEvent
            ? 'bg-gradient-to-r from-[rgba(249,115,22,0.16)] to-[rgba(251,191,36,0.06)] border-[rgba(249,115,22,0.28)]'
            : !hasEvents && isAdmin
              ? 'bg-gradient-to-r from-[rgba(249,115,22,0.12)] to-[rgba(251,191,36,0.04)] border-[rgba(249,115,22,0.22)]'
              : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)]'}`}
        style={{ fontFamily: 'inherit' }}
      >
        <DateTile event={currentEvent} />
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-extrabold tracking-tight truncate"
            style={{ color: currentEvent || (!hasEvents && isAdmin) ? 'var(--text)' : 'var(--muted)' }}
          >
            {eventLabel}
          </div>
          <div className="text-xs font-bold mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
            {group?.name}
          </div>
        </div>
        <span className="shrink-0" style={{ color: 'var(--muted)' }}>
          <IconChevronDown size={14} />
        </span>
      </button>
    </div>
  )
}
