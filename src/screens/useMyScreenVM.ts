import { useState } from 'react'

import { fmt } from '@shared/lib/session'
import { isEventItemsLocked } from '@shared/lib/event-status'

import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

export function useMyScreenVM() {
  const serverState       = useWsStore(s => s.serverState)
  const send              = useWsStore(s => s.send)
  const me                = useSessionStore(s => s.me)
  const showToast         = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [scanOpen, setScanOpen] = useState(false)

  // ── Derived data ─────────────────────────────────────────────────────────────
  const allItems    = serverState?.items   ?? []
  const members     = serverState?.members ?? []
  const events      = serverState?.events  ?? []

  const items       = currentEventId ? allItems.filter(i => i.event_id === currentEventId) : allItems
  const myItems     = items.filter(i => i.buyer_id === me?.id)
  const boughtItems = myItems.filter(i => i.bought && i.price > 0)
  const actualTotal = boughtItems.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = myItems.filter(i => i.bought).length
  const pct         = myItems.length ? Math.round(boughtCount / myItems.length * 100) : 0
  const amIAdmin    = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const listLocked  = isEventItemsLocked(currentEvent?.status)
  const sorted      = [...myItems].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }))

  // ── Actions ──────────────────────────────────────────────────────────────────
  function showLockedToast() {
    showToast('Событие завершено — список только для просмотра', 'muted')
  }

  function toggleBought(id: string, val: boolean) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'bought', value: val })
  }

  function updatePrice(id: string, price: number) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'price', value: price })
    if (price > 0) showToast('Цена обновлена')
  }

  function changeQty(id: string, cur: number, d: number) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'qty', value: Math.max(0, +(Number(cur) + d).toFixed(2)) })
  }

  return {
    // data
    me, events, members, myItems, sorted, amIAdmin,
    // totals
    actualTotal, boughtItems, boughtCount, pct, listLocked,
    // scan
    scanOpen, setScanOpen,
    // actions
    toggleBought, updatePrice, changeQty, showLockedToast, setShowEventSheet,
    // utils
    fmt, currentEventId,
  }
}
