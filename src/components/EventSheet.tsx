import { useEffect, useRef, useState } from 'react'
import { isEventActive } from '../lib/event-status'
import { useWsStore } from '../stores/wsStore'
import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { useToastStore } from '../stores/toastStore'
import { IconCheck, IconMapPin, IconCalendar } from './Icon'
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

// ── EventCreateModal (inline в шторке) ────────────────────────────────────────

interface CreateModalProps {
  onSave: (data: Partial<PicnicEvent>) => void
  onClose: () => void
}

function EventCreateModal({ onSave, onClose }: CreateModalProps) {
  const [name,     setName]     = useState('')
  const [date,     setDate]     = useState('')
  const [time,     setTime]     = useState('')
  const [location, setLocation] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 12,
    background: 'rgba(255,240,200,.06)', border: '1px solid rgba(255,220,150,0.15)',
    color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    outline: 'none', boxSizing: 'border-box',
  }

  const canSubmit = name.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSave({
      name: name.trim(),
      event_date: date || null,
      event_time: time || null,
      location: location.trim() || null,
    })
  }

  return (
    <form className="flex flex-col gap-3 pt-2" onSubmit={handleSubmit}>
      <div className="text-[13px] font-extrabold mb-1" style={{ color: 'var(--text)' }}>
        Новое событие
      </div>
      <input
        style={inputStyle}
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название события"
        autoFocus
        required
      />
      <div className="flex gap-2">
        <input
          type="date"
          style={{ ...inputStyle, flex: 1, colorScheme: 'dark' }}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          type="time"
          style={{ ...inputStyle, width: 100, colorScheme: 'dark' }}
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>
      <input
        style={inputStyle}
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="Место (необязательно)"
      />
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-[12px] rounded-[12px] border-none cursor-pointer font-bold text-[13px]"
          style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)', fontFamily: 'inherit' }}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 py-[12px] rounded-[12px] border-none cursor-pointer font-extrabold text-[14px]"
          style={{
            background: canSubmit ? 'var(--accent)' : 'rgba(249,115,22,.3)',
            color: '#fff',
            fontFamily: 'inherit',
            opacity: canSubmit ? 1 : 0.6,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Создать
        </button>
      </div>
    </form>
  )
}

// ── EventSheet ────────────────────────────────────────────────────────────────

export function EventSheet() {
  const serverState       = useWsStore(s => s.serverState)
  const send              = useWsStore(s => s.send)
  const wsOk              = useWsStore(s => s.wsOk)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const showEventSheet    = useAppStore(s => s.showEventSheet)
  const enterEvent        = useAppStore(s => s.enterEvent)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const me                = useSessionStore(s => s.me)
  const showToast         = useToastStore(s => s.show)

  const isAdmin = !!serverState?.members.find(m => m.user_id === me?.id)?.is_admin

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating]     = useState(false)
  const pendingNameRef              = useRef<string | null>(null)

  const events    = serverState?.events ?? []
  const hasEvents = events.length > 0
  const items     = serverState?.items ?? []

  useEffect(() => {
    if (!showEventSheet) {
      setShowCreate(false)
      setCreating(false)
      pendingNameRef.current = null
      return
    }
    if (!hasEvents && isAdmin && !creating) setShowCreate(true)
  }, [showEventSheet, hasEvents, isAdmin, creating])

  useEffect(() => {
    if (!creating || !pendingNameRef.current) return
    const created = events.find(
      e => e.name === pendingNameRef.current && isEventActive(e.status),
    )
    if (!created) return
    enterEvent(created.id)
    setShowEventSheet(false)
    showToast(`Событие «${created.name}» создано`)
    pendingNameRef.current = null
    setCreating(false)
  }, [events, creating, enterEvent, setShowEventSheet, showToast])

  useEffect(() => {
    if (!creating) return
    const timeoutId = window.setTimeout(() => {
      if (!pendingNameRef.current) return
      pendingNameRef.current = null
      setCreating(false)
      setShowCreate(true)
      showToast('Не удалось создать событие. Проверьте подключение и права администратора', 'error')
    }, 8000)
    return () => clearTimeout(timeoutId)
  }, [creating, showToast])

  if (!showEventSheet) return null

  const active    = events.filter(e => isEventActive(e.status))
  const completed = events.filter(e => !isEventActive(e.status))

  function itemCount(eventId: string) {
    return items.filter(i => i.event_id === eventId).length
  }

  function handleCreate(data: Partial<PicnicEvent>) {
    const name = data.name?.trim()
    if (!name) {
      showToast('Укажите название события', 'muted')
      return
    }
    if (!wsOk) {
      showToast('Нет подключения к серверу', 'error')
      return
    }
    const sent = send({
      type: 'event:add',
      name,
      date: data.event_date ?? null,
      time: data.event_time ?? null,
      location: data.location ?? null,
    })
    if (!sent) {
      showToast('Не удалось отправить — нет подключения', 'error')
      return
    }
    pendingNameRef.current = name
    setCreating(true)
    setShowCreate(false)
  }

  function closeSheet() {
    setShowEventSheet(false)
    setShowCreate(false)
    setCreating(false)
    pendingNameRef.current = null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[150]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={closeSheet}
      />

      <div
        className="event-sheet-panel fixed left-0 right-0 z-[160] mx-auto"
        style={{
          bottom: 0,
          maxWidth: 500,
          background: '#1e1912',
          border: '1px solid rgba(255,220,150,0.12)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 16px',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="modal-drag-handle mx-auto mb-4"
          style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.15)' }}
        />

        {creating && (
          <div className="text-center py-3 text-[13px] font-bold" style={{ color: 'var(--muted)' }}>
            Создаём событие…
          </div>
        )}

        {!showCreate && !creating ? (
          <>
            <div className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              Событие
            </div>

            {!hasEvents && (
              <div className="text-center py-4 mb-2">
                <div className="mb-3" style={{ color: 'var(--muted)', opacity: 0.4 }}>
                  <IconCalendar size={36} />
                </div>
                <div className="text-[14px] font-extrabold mb-1">Нет событий</div>
                <p className="text-[12px] leading-relaxed px-2 mb-4" style={{ color: 'var(--muted)' }}>
                  {isAdmin
                    ? 'Создайте первое событие для списка покупок'
                    : 'Организатор группы ещё не создал событие'}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="w-full py-3 rounded-md border-none cursor-pointer text-sm font-extrabold"
                    style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}
                  >
                    ＋ Создать событие
                  </button>
                )}
              </div>
            )}

            {active.length > 0 && (
              <div className="flex flex-col gap-[6px]">
                {active.map(e => (
                  <div key={e.id}>
                    <button
                      type="button"
                      onClick={() => { enterEvent(e.id); setShowEventSheet(false) }}
                      className="flex items-center gap-3 w-full text-left rounded-[12px] border-none cursor-pointer transition-all duration-150 active:opacity-80"
                      style={{
                        padding: '11px 13px',
                        background: currentEventId === e.id ? 'rgba(249,115,22,.12)' : 'rgba(255,255,255,.04)',
                        border: `1px solid ${currentEventId === e.id ? 'rgba(249,115,22,.25)' : 'rgba(255,255,255,.08)'}`,
                        fontFamily: 'inherit',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold truncate" style={{ color: 'var(--text)' }}>{e.name}</div>
                        <div className="text-[11px] mt-[2px]" style={{ color: 'var(--muted)' }}>
                          {formatDate(e.event_date, e.event_time)}
                        </div>
                        {e.location && (
                          <div className="flex items-center gap-[3px] text-[11px] mt-[2px]" style={{ color: 'rgba(251,191,36,.65)' }}>
                            <IconMapPin size={10} strokeWidth={2} /> {e.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
                          {itemCount(e.id)} поз.
                        </span>
                        {currentEventId === e.id && (
                          <span style={{ color: 'var(--accent)' }}><IconCheck size={14} strokeWidth={2.5} /></span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'rgba(245,240,234,.25)' }}>
                  Завершённые
                </div>
                <div className="flex flex-col gap-[6px]">
                  {completed.map(e => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => { enterEvent(e.id); setShowEventSheet(false) }}
                      className="flex items-center gap-3 w-full text-left rounded-[12px] border-none cursor-pointer"
                      style={{
                        padding: '10px 13px', opacity: 0.5,
                        background: currentEventId === e.id ? 'rgba(249,115,22,.08)' : 'rgba(255,255,255,.03)',
                        border: '1px solid rgba(255,255,255,.06)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold truncate" style={{ color: 'var(--text)' }}>{e.name}</div>
                        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{formatDate(e.event_date, null)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
                          {itemCount(e.id)} поз.
                        </span>
                        {currentEventId === e.id && <IconCheck size={13} strokeWidth={2.5} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && hasEvents && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="w-full mt-3 py-[12px] rounded-[12px] border-none cursor-pointer font-bold text-[13px] flex items-center justify-center gap-2"
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(255,255,255,.15)',
                  color: 'rgba(245,240,234,.4)',
                  fontFamily: 'inherit',
                }}
              >
                + Новое событие
              </button>
            )}
          </>
        ) : !creating ? (
          <EventCreateModal
            onSave={handleCreate}
            onClose={() => setShowCreate(false)}
          />
        ) : null}
      </div>
    </>
  )
}
