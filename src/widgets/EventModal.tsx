import { useState } from 'react'
import { IconX } from '@shared/ui/Icon'
import type { PicnicEvent } from '@shared/types'

export interface EventModalProps {
  event?: PicnicEvent
  onSave: (data: Partial<PicnicEvent>) => void
  onClose: () => void
  onDelete?: () => void
}

export function EventModal({ event, onSave, onClose, onDelete }: EventModalProps) {
  const [name,        setName]        = useState(event?.name        ?? '')
  const [date,        setDate]        = useState(event?.event_date  ?? '')
  const [time,        setTime]        = useState(event?.event_time  ? event.event_time.slice(0, 5) : '')
  const [location,    setLocation]    = useState(event?.location    ?? '')
  const [description, setDescription] = useState(event?.description ?? '')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 12,
    background: 'var(--surface-input)', border: '1px solid var(--card-b)',
    color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'var(--surface-scrim-heavy)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] rounded-t-[24px] p-5 pb-8"
        style={{ background: 'var(--surface-modal-deep)', border: '1px solid var(--card-b)' }}
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
              style={{ background: 'var(--surface-danger-12)', color: 'var(--red)', fontFamily: 'inherit', border: '1px solid var(--surface-danger-25)' }}>
              Удалить
            </button>
          )}
          <button
            onClick={() => {
              if (!name.trim()) return
              onSave({ name: name.trim(), event_date: date || null, event_time: time || null, location: location || null, description: description || null })
            }}
            className="flex-1 py-[13px] rounded-[12px] border-none cursor-pointer font-extrabold text-[15px]"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit', opacity: name.trim() ? 1 : 0.5 }}>
            {event ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  )
}
