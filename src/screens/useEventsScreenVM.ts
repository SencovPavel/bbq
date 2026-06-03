import { useState, useMemo, useCallback } from 'react'
import { useWsStore } from '@stores/wsStore'
import { useAppStore } from '@stores/appStore'
import { sendEventUpdates } from '@shared/lib/event-update'
import type { PicnicEvent } from '@shared/types'

// ── Pure helpers (exported so EventsScreen.tsx can reuse them) ────────────────

export function formatDate(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return 'Дата не указана'
  const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })
  if (!timeStr) return day
  const [h, m] = timeStr.split(':')
  return `${day} · ${h}:${m}`
}

export function isPast(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr.slice(0, 10) + 'T23:59:59') < new Date()
}

// ── ViewModel ─────────────────────────────────────────────────────────────────

export function useEventsScreenVM() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const enterEvent  = useAppStore(s => s.enterEvent)

  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState<PicnicEvent | undefined>(undefined)

  const events = useMemo(
    () => serverState?.events ?? [],
    [serverState?.events],
  )
  const items = useMemo(
    () => serverState?.items ?? [],
    [serverState?.items],
  )

  const upcoming = useMemo(() => events.filter(e => !isPast(e.event_date)), [events])
  const past     = useMemo(() => events.filter(e =>  isPast(e.event_date)), [events])

  const itemCount = useCallback(
    (eventId: string) => items.filter(i => i.event_id === eventId).length,
    [items],
  )

  function openCreate() {
    setEditEvent(undefined)
    setShowModal(true)
  }

  function openEdit(event: PicnicEvent) {
    setEditEvent(event)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditEvent(undefined)
  }

  function handleSave(data: Partial<PicnicEvent>) {
    if (editEvent) {
      sendEventUpdates(send, editEvent.id, data)
    } else {
      send({
        type: 'event:add',
        name: data.name,
        date: data.event_date,
        time: data.event_time,
        location: data.location,
        description: data.description,
      })
    }
    closeModal()
  }

  function handleDelete() {
    if (!editEvent) return
    send({ type: 'event:delete', id: editEvent.id })
    closeModal()
  }

  return {
    events,
    upcoming,
    past,
    showModal,
    editEvent,
    itemCount,
    enterEvent,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    handleDelete,
  }
}
