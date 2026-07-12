import { IconPencil, IconCalendar, IconMapPin, IconPlus } from '@shared/ui/Icon'
import { EventModal } from '@widgets/EventModal'
import { EVENT_TYPES_BY_ID } from '@shared/config/event-types'
import { useEventsScreenVM, formatDate, isPast } from './useEventsScreenVM'
import type { PicnicEvent } from '@shared/types'

// ── EventCard ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: PicnicEvent
  itemCount: number
  isCurrent: boolean
  onEnter: () => void
  onEdit: () => void
}

function EventCard({ event, itemCount, isCurrent, onEnter, onEdit }: EventCardProps) {
  const past = isPast(event.event_date)
  const d = event.event_date ? new Date(event.event_date.slice(0, 10) + 'T00:00:00') : null
  const eventType = event.type ? EVENT_TYPES_BY_ID[event.type] : undefined

  return (
    <div
      className="relative rounded-[14px] p-4 cursor-pointer transition-all duration-150 active:scale-[.98]"
      style={{
        background: past
          ? 'var(--surface-subtle)'
          : (isCurrent ? 'linear-gradient(135deg, var(--surface-fire-18), var(--surface-amber-6))' : 'var(--surface-cream-6)'),
        border: `1px solid ${past ? 'var(--surface-white-8)' : (isCurrent ? 'var(--surface-fire-30)' : 'var(--gb)')}`,
        opacity: past ? 0.7 : 1,
        backdropFilter: 'blur(20px)',
      }}
      onClick={onEnter}
    >
      {isCurrent && (
        <div
          className="absolute -top-px right-3.5 px-2.5 py-[3px] text-[9.5px] font-extrabold uppercase"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: '0 0 8px 8px', letterSpacing: '.08em' }}
        >
          Текущее
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="flex flex-col items-center justify-center rounded-[12px] shrink-0"
          style={{
            width: 52, height: 52,
            background: past ? 'var(--surface-white-6)' : 'var(--surface-fire-14)',
            border: `1px solid ${past ? 'var(--gb)' : 'var(--surface-fire-25)'}`,
            color: past ? 'var(--muted)' : 'var(--accent)',
          }}
        >
          <div className="text-[20px] font-black leading-none" style={{ letterSpacing: '-.02em' }}>
            {d ? d.getDate() : '—'}
          </div>
          <div className="text-[9.5px] font-bold uppercase mt-0.5" style={{ letterSpacing: '.08em', opacity: .8 }}>
            {d ? d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '—'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 flex items-center gap-[6px] min-w-0">
              {eventType && <span className="text-[14px] shrink-0">{eventType.icon}</span>}
              <div className="font-black text-[15px] truncate" style={{ color: 'var(--text)', letterSpacing: '-.01em' }}>
                {event.name}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onEdit() }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0 }}>
              <IconPencil size={14} />
            </button>
          </div>
          <div className="text-[12px] mt-[2px]" style={{ color: 'var(--muted)' }}>
            {formatDate(event.event_date, event.event_time)}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            {event.location && (
              <span
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-[2px] rounded-pill"
                style={{ color: 'var(--accent-2)', background: 'var(--surface-amber-10)', border: '1px solid var(--surface-amber-20)' }}
              >
                <IconMapPin size={10} strokeWidth={2} />
                {event.location}
              </span>
            )}
            <span
              className="text-[11px] font-bold px-2 py-[2px] rounded-pill"
              style={{ background: 'var(--surface-fire-12)', color: 'var(--accent)', border: '1px solid var(--surface-fire-20)' }}
            >
              {itemCount} поз.
            </span>
          </div>
        </div>
      </div>

      {event.description && (
        <div className="text-[12px] mt-2.5 leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
          {event.description}
        </div>
      )}
    </div>
  )
}

// ── EventsScreen ──────────────────────────────────────────────────────────────

export function EventsScreen() {
  const vm = useEventsScreenVM()
  const { events, upcoming, past, currentEventId, showModal, editEvent,
          itemCount, enterEvent, openCreate, openEdit, closeModal,
          handleSave, handleDelete } = vm

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-[17px]" style={{ color: 'var(--text)' }}>
            События
          </h2>
          {events.length > 0 && (
            <div className="text-[12px] mt-[2px]" style={{ color: 'var(--muted)' }}>
              {upcoming.length} впереди · {past.length} прошлых
            </div>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-[5px] rounded-full border-none cursor-pointer font-bold text-[13px] transition-opacity active:opacity-70"
          style={{ padding: '8px 14px', background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}>
          <IconPlus size={13} strokeWidth={2.6} /> Создать
        </button>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3" style={{ color: 'var(--muted)', opacity: 0.5 }}><IconCalendar size={48} /></div>
          <div className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>
            Нет событий
          </div>
          <div className="text-[13px]" style={{ color: 'var(--muted)' }}>
            Создайте первый пикник,<br />шашлык или вечеринку
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-5">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--muted)' }}>
            Впереди
          </div>
          <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {upcoming.map(e => (
              <EventCard key={e.id} event={e} itemCount={itemCount(e.id)}
                isCurrent={e.id === currentEventId}
                onEnter={() => enterEvent(e.id)}
                onEdit={() => openEdit(e)} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <div className="text-[10.5px] font-extrabold uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--muted)' }}>
            Прошедшие
          </div>
          <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {past.map(e => (
              <EventCard key={e.id} event={e} itemCount={itemCount(e.id)}
                isCurrent={e.id === currentEventId}
                onEnter={() => enterEvent(e.id)}
                onEdit={() => openEdit(e)} />
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <EventModal
          event={editEvent}
          onSave={handleSave}
          onClose={closeModal}
          onDelete={editEvent ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
