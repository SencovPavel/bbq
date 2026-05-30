import { useEffect, useState, type CSSProperties } from 'react'

import { Modal, ModalButtons } from './Modal'

import type { PicnicEvent } from '../types'

interface EventEditModalProps {
  open: boolean
  event: PicnicEvent
  onClose: () => void
  onSave: (data: Partial<Pick<PicnicEvent, 'name' | 'event_date' | 'event_time' | 'location'>>) => void
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 12,
  background: 'rgba(255,240,200,.06)',
  border: '1px solid rgba(255,220,150,0.15)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelClass = 'block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider'

export function EventEditModal({ open, event, onClose, onSave }: EventEditModalProps) {
  const [name, setName] = useState(event.name)
  const [date, setDate] = useState(event.event_date ?? '')
  const [time, setTime] = useState(event.event_time?.slice(0, 5) ?? '')
  const [location, setLocation] = useState(event.location ?? '')

  useEffect(() => {
    if (!open) return
    setName(event.name)
    setDate(event.event_date ?? '')
    setTime(event.event_time?.slice(0, 5) ?? '')
    setLocation(event.location ?? '')
  }, [open, event])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      event_date: date || null,
      event_time: time || null,
      location: location || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Редактировать событие">
      <div>
        <label className={labelClass} style={{ color: 'var(--muted)' }}>
          Название *
        </label>
        <input
          style={inputStyle}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Пикник на природе"
          autoFocus
        />
      </div>

      <div className="flex gap-2 mt-3">
        <div className="flex-1 min-w-0">
          <label className={labelClass} style={{ color: 'var(--muted)' }}>
            Дата
          </label>
          <input
            type="date"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div style={{ width: 110 }}>
          <label className={labelClass} style={{ color: 'var(--muted)' }}>
            Время
          </label>
          <input
            type="time"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass} style={{ color: 'var(--muted)' }}>
          Место
        </label>
        <input
          style={inputStyle}
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Парк, дача…"
        />
      </div>

      <ModalButtons
        onCancel={onClose}
        onConfirm={handleSave}
        cancelText="Отмена"
        confirmText="Сохранить"
        danger={false}
      />
    </Modal>
  )
}
