import { useState, useMemo } from 'react'

import { fmt } from '@shared/lib/session'
import { isEventItemsLocked } from '@shared/lib/event-status'

import { useWsStore } from '@stores/wsStore'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore } from '@stores/appStore'
import { useToastStore } from '@stores/toastStore'

export function useMyScreenVM() {
  const serverState       = useWsStore(s => s.serverState)
  const send              = useWsStore(s => s.send)
  const me                = useSessionStore(s => s.me)
  const showToast         = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [scanOpen, setScanOpen] = useState(false)

  // ── Derived data ─────────────────────────────────────────────────────────────
  const allItems = serverState?.items   ?? []
  const members  = serverState?.members ?? []
  const events   = serverState?.events  ?? []
  const meId     = me?.id

  const currentEvent = useMemo(
    () => currentEventId ? events.find(e => e.id === currentEventId) : undefined,
    [events, currentEventId],
  )
  const listLocked = isEventItemsLocked(currentEvent?.status)

  const amIAdmin = useMemo(
    () => members.find(m => m.user_id === meId)?.is_admin ?? false,
    [members, meId],
  )

  const items = useMemo(
    () => currentEventId ? allItems.filter(i => i.event_id === currentEventId) : allItems,
    [allItems, currentEventId],
  )

  const myItems = useMemo(
    () => items.filter(i => i.buyer_id === meId),
    [items, meId],
  )

  const boughtItems = useMemo(
    () => myItems.filter(i => i.bought && i.price > 0),
    [myItems],
  )

  const actualTotal = useMemo(
    () => boughtItems.reduce((s, i) => s + i.price * i.qty, 0),
    [boughtItems],
  )

  const boughtCount = useMemo(() => myItems.filter(i => i.bought).length, [myItems])
  const pct         = myItems.length ? Math.round(boughtCount / myItems.length * 100) : 0

  const sorted = useMemo(
    () => [...myItems].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })),
    [myItems],
  )

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
