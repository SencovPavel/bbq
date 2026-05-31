import { IconPencil, IconCalendar, IconMapPin } from '@shared/ui/Icon'
import { EventModal } from '@widgets/EventModal'
import { useEventsScreenVM, formatDate, isPast } from './useEventsScreenVM'
import type { PicnicEvent } from '@shared/types'

// ── EventCard ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: PicnicEvent
  itemCount: number
  onEnter: () => void
  onEdit: () => void
}

function EventCard({ event, itemCount, onEnter, onEdit }: EventCardProps) {
  const past = isPast(event.event_date)

  return (
    <div
      className="rounded-[16px] p-4 cursor-pointer transition-all duration-150 active:scale-[.98]"
      style={{
        background: past ? 'var(--surface-subtle)' : 'var(--card)',
        border: `1px solid ${past ? 'var(--surface-white-8)' : 'var(--card-b)'}`,
        opacity: past ? 0.65 : 1,
      }}
      onClick={onEnter}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[15px] truncate mb-1" style={{ color: 'var(--text)' }}>
            {event.name}
          </div>
          <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {formatDate(event.event_date, event.event_time)}
          </div>
          {event.location && (
            <div className="flex items-center gap-[4px] text-[12px] mt-[3px] truncate" style={{ color: 'var(--surface-amber-70)' }}>
              <IconMapPin size={11} strokeWidth={2} />
              {event.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'var(--surface-fire-12)', color: 'var(--accent)', border: '1px solid var(--surface-fire-20)' }}>
            {itemCount} поз.
          </div>
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <IconPencil size={15} />
          </button>
        </div>
      </div>

      {event.description && (
        <div className="text-[12px] mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {event.description}
        </div>
      )}
    </div>
  )
}

// ── EventsScreen ──────────────────────────────────────────────────────────────

export function EventsScreen() {
  const vm = useEventsScreenVM()
  const { events, upcoming, past, showModal, editEvent,
          itemCount, enterEvent, openCreate, openEdit, closeModal,
          handleSave, handleDelete } = vm

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-[17px]" style={{ color: 'var(--text)' }}>
          События
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-[6px] rounded-full border-none cursor-pointer font-bold text-[13px] transition-opacity active:opacity-70"
          style={{ padding: '8px 14px', background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}>
          + Создать
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
        <div className="flex flex-col gap-3 mb-4">
          {upcoming.map(e => (
            <EventCard key={e.id} event={e} itemCount={itemCount(e.id)}
              onEnter={() => enterEvent(e.id)}
              onEdit={() => openEdit(e)} />
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
            Прошедшие
          </div>
          <div className="flex flex-col gap-3">
            {past.map(e => (
              <EventCard key={e.id} event={e} itemCount={itemCount(e.id)}
                onEnter={() => enterEvent(e.id)}
                onEdit={() => openEdit(e)} />
            ))}
          </div>
        </>
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
