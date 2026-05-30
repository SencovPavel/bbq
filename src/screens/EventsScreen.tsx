import { useState } from 'react'
import { useWsStore } from '../stores/wsStore'
import { useAppStore } from '../stores/appStore'
import { sendEventUpdates } from '../lib/event-update'
import { IconX, IconPencil, IconCalendar, IconMapPin } from '../components/Icon'
import type { PicnicEvent } from '../types'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return 'Дата не указана'
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
  if (!timeStr) return day
  const [h, m] = timeStr.split(':')
  return `${day} · ${h}:${m}`
}

function isPast(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr + 'T23:59:59') < new Date()
}

// ── EventModal ────────────────────────────────────────────────────────────────

interface EventModalProps {
  event?: PicnicEvent
  onSave: (data: Partial<PicnicEvent>) => void
  onClose: () => void
  onDelete?: () => void
}

function EventModal({ event, onSave, onClose, onDelete }: EventModalProps) {
  const [name,        setName]        = useState(event?.name        ?? '')
  const [date,        setDate]        = useState(event?.event_date  ?? '')
  const [time,        setTime]        = useState(event?.event_time  ? event.event_time.slice(0, 5) : '')
  const [location,    setLocation]    = useState(event?.location    ?? '')
  const [description, setDescription] = useState(event?.description ?? '')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 12,
    background: 'rgba(255,240,200,.06)', border: '1px solid rgba(255,220,150,0.15)',
    color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] rounded-t-[24px] p-5 pb-8"
        style={{ background: '#1a1510', border: '1px solid rgba(255,220,150,0.12)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="font-extrabold text-[16px]" style={{ color: 'var(--text)' }}>
            {event ? 'Редактировать' : 'Новое событие'}
          </span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
            <IconX size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Название *
            </label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
              placeholder="Пикник на природе" autoFocus />
          </div>

          <div className="flex gap-2">
            <div style={{ flex: 1 }}>
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Дата
              </label>
              <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={{ width: 110 }}>
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Время
              </label>
              <input type="time" style={{ ...inputStyle, colorScheme: 'dark' }}
                value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Место
            </label>
            <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Парк Сокольники" />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Заметки
            </label>
            <textarea
              style={{ ...inputStyle, resize: 'none', minHeight: 72, lineHeight: 1.5 }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Любые заметки про событие…"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {onDelete && (
            <button onClick={onDelete}
              className="py-[13px] px-4 rounded-[12px] border-none cursor-pointer font-bold text-[13px]"
              style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)', fontFamily: 'inherit', border: '1px solid rgba(239,68,68,0.25)' }}>
              Удалить
            </button>
          )}
          <button
            onClick={() => {
              if (!name.trim()) return
              onSave({ name: name.trim(), event_date: date || null, event_time: time || null, location: location || null, description: description || null })
            }}
            className="flex-1 py-[13px] rounded-[12px] border-none cursor-pointer font-extrabold text-[15px]"
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit', opacity: name.trim() ? 1 : 0.5 }}>
            {event ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  )
}

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
        background: past ? 'rgba(255,255,255,0.03)' : 'rgba(255,240,200,0.05)',
        border: `1px solid ${past ? 'rgba(255,255,255,0.08)' : 'rgba(255,220,150,0.15)'}`,
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
            <div className="flex items-center gap-[4px] text-[12px] mt-[3px] truncate" style={{ color: 'rgba(251,191,36,0.7)' }}>
              <IconMapPin size={11} strokeWidth={2} />
              {event.location}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.2)' }}>
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
        <div className="text-[12px] mt-2 leading-relaxed line-clamp-2" style={{ color: 'rgba(245,240,234,0.5)' }}>
          {event.description}
        </div>
      )}
    </div>
  )
}

// ── EventsScreen ──────────────────────────────────────────────────────────────

export function EventsScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const enterEvent  = useAppStore(s => s.enterEvent)

  const [showModal,  setShowModal]  = useState(false)
  const [editEvent,  setEditEvent]  = useState<PicnicEvent | undefined>(undefined)

  const events = serverState?.events ?? []
  const items  = serverState?.items  ?? []

  const upcoming = events.filter(e => !isPast(e.event_date))
  const past     = events.filter(e =>  isPast(e.event_date))

  function itemCount(eventId: string) {
    return items.filter(i => i.event_id === eventId).length
  }

  function handleSave(data: Partial<PicnicEvent>) {
    if (editEvent) {
      sendEventUpdates(send, editEvent.id, data)
    } else {
      send({ type: 'event:add', name: data.name, date: data.event_date, time: data.event_time, location: data.location, description: data.description })
    }
    setShowModal(false)
    setEditEvent(undefined)
  }

  function handleDelete() {
    if (!editEvent) return
    send({ type: 'event:delete', id: editEvent.id })
    setShowModal(false)
    setEditEvent(undefined)
  }

  return (
    <div className="px-4 pt-4" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-[17px]" style={{ color: 'var(--text)' }}>
          События
        </h2>
        <button
          onClick={() => { setEditEvent(undefined); setShowModal(true) }}
          className="flex items-center gap-[6px] rounded-full border-none cursor-pointer font-bold text-[13px] transition-opacity active:opacity-70"
          style={{ padding: '8px 14px', background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
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
              onEdit={() => { setEditEvent(e); setShowModal(true) }} />
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
                onEdit={() => { setEditEvent(e); setShowModal(true) }} />
            ))}
          </div>
        </>
      )}

      {showModal && (
        <EventModal
          event={editEvent}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditEvent(undefined) }}
          onDelete={editEvent ? handleDelete : undefined}
        />
      )}
    </div>
  )
}
