import { useState } from 'react'

import { fmt, clearGroupSession } from '@shared/lib/session'
import { shortDate } from '@shared/lib/format'
import { canAdminCompleteEvent, isEventActive } from '@shared/lib/event-status'
import { sendEventUpdates } from '@shared/lib/event-update'

import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

import type { PicnicEvent } from '@shared/types'

// ── Pure helpers ─────────────────────────────────────────────────────────────

/** Integer days from today to dateStr (negative = past). */
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function pluralDays(n: number): string {
  if (n === 1) return 'день'
  if (n >= 2 && n <= 4) return 'дня'
  return 'дней'
}

// Circumference for r=15 SVG ring: 2π×15 ≈ 94.25
const C = 94.25

export function useEventScreenVM() {
  const serverState       = useWsStore(s => s.serverState)
  const send              = useWsStore(s => s.send)
  const resetWs           = useWsStore(s => s.reset)
  const me                = useSessionStore(s => s.me)
  const setGroupId        = useSessionStore(s => s.setGroupId)
  const setScreen         = useAppStore(s => s.setScreen)
  const setTab            = useAppStore(s => s.setTab)
  const exitEvent         = useAppStore(s => s.exitEvent)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const showToast         = useToastStore(s => s.show)

  // ── Modal open/close state ────────────────────────────────────────────────
  const [copied,             setCopied]             = useState(false)
  const [confirmKick,        setConfirmKick]        = useState<{ userId: string; name: string } | null>(null)
  const [confirmDemote,      setConfirmDemote]      = useState<{ userId: string; name: string } | null>(null)
  const [confirmLeave,       setConfirmLeave]       = useState(false)
  const [confirmDelete,      setConfirmDelete]      = useState(false)
  const [confirmComplete,    setConfirmComplete]    = useState(false)
  const [showDescriptionEdit, setShowDescriptionEdit] = useState(false)
  const [showEventEdit,      setShowEventEdit]      = useState(false)

  // ── Derived data ──────────────────────────────────────────────────────────
  const { members = [], items = [], group, events = [] } = serverState ?? {}
  const currentEvent    = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const amIAdmin        = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const canCompleteEvent = canAdminCompleteEvent(amIAdmin, currentEvent)

  // Countdown
  const daysLeft = daysUntil(currentEvent?.event_date ?? null)
  const countdownLabel =
    daysLeft === null  ? null          :
    daysLeft < 0       ? 'Прошло'     :
    daysLeft === 0     ? 'Сегодня'    :
    daysLeft === 1     ? 'Завтра'     :
    `Через ${daysLeft} ${pluralDays(daysLeft)}`

  const urgency =
    daysLeft === null || daysLeft < 0
      ? { dot: 'var(--muted)',    text: 'var(--muted)',    border: 'rgba(255,255,255,.14)', glow: 'none' }
    : daysLeft <= 1
      ? { dot: 'var(--red)',      text: 'var(--red)',      border: 'rgba(248,113,113,.4)',  glow: '0 0 8px rgba(248,113,113,.7)' }
    : daysLeft <= 4
      ? { dot: 'var(--accent-2)', text: 'var(--accent-2)', border: 'rgba(251,191,36,.4)',   glow: '0 0 8px rgba(251,191,36,.7)' }
      : { dot: '#4ade80',         text: '#4ade80',         border: 'rgba(74,222,128,.38)',  glow: '0 0 8px rgba(74,222,128,.6)' }

  // Readiness ring
  const evItems  = currentEventId ? items.filter(i => i.event_id === currentEventId && i.enabled) : []
  const evBought = evItems.filter(i => i.bought)
  const readyPct = evItems.length ? Math.round(evBought.length / evItems.length * 100) : 0
  const readyColor = readyPct === 100 ? '#4ade80' : 'var(--accent-2)'

  // Member spend
  const eventItems = currentEventId ? items.filter(i => i.event_id === currentEventId) : items

  // ── Actions ───────────────────────────────────────────────────────────────
  function handleCompleteEvent() {
    if (!currentEvent) return
    send({ type: 'event:complete', id: currentEvent.id })
    exitEvent()
    showToast(`Событие «${currentEvent.name}» завершено`)
    setConfirmComplete(false)
  }

  function handleSaveDescription(description: string | null) {
    if (!currentEvent) return
    sendEventUpdates(send, currentEvent.id, { description })
    showToast('Заметки сохранены')
    setShowDescriptionEdit(false)
  }

  function handleSaveEvent(data: Partial<Pick<PicnicEvent, 'name' | 'event_date' | 'event_time' | 'location'>>) {
    if (!currentEvent) return
    sendEventUpdates(send, currentEvent.id, data)
    showToast('Событие обновлено')
    setShowEventEdit(false)
  }

  function copyCode() {
    const code = group?.invite_code
    if (!code) return
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    showToast('Код скопирован: ' + code)
  }

  function shareCode() {
    const code = group?.invite_code
    if (!code) return
    const text = `Присоединяйся к «${group?.name}» в Котёл! Код: ${code}`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).catch(() => {})
      showToast('Приглашение скопировано')
    }
  }

  function navigateToGroups() {
    clearGroupSession()
    setGroupId(null)
    resetWs()
    exitEvent()
    setShowEventSheet(false)
    setScreen('groups')
  }

  function promoteMember(userId: string, name: string, isAdmin: boolean) {
    if (isAdmin) {
      setConfirmDemote({ userId, name })
    } else {
      send({ type: 'member:promote', userId })
      showToast(`${name} теперь администратор`)
    }
  }

  return {
    // data
    events, members, items, group, eventItems, evItems, evBought,
    currentEvent, amIAdmin, canCompleteEvent,
    // countdown
    countdownLabel, urgency, daysLeft,
    // ring
    readyPct, readyColor, C,
    // modals
    copied, confirmKick, confirmDemote, confirmLeave, confirmDelete,
    confirmComplete, showDescriptionEdit, showEventEdit,
    setConfirmKick, setConfirmDemote, setConfirmLeave, setConfirmDelete,
    setConfirmComplete, setShowDescriptionEdit, setShowEventEdit,
    // actions
    handleCompleteEvent, handleSaveDescription, handleSaveEvent,
    copyCode, shareCode, navigateToGroups, promoteMember,
    setShowEventSheet, setTab, send, me,
    // utils
    fmt, shortDate, isEventActive,
  }
}
