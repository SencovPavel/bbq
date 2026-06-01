import { useState, useMemo, useCallback } from 'react'

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

  const rsvp          = serverState?.rsvp          ?? []
  const familyMembers = serverState?.familyMembers  ?? []
  const familyRsvp    = serverState?.familyRsvp     ?? []

  const currentEvent = useMemo(
    () => currentEventId ? events.find(e => e.id === currentEventId) : undefined,
    [events, currentEventId],
  )
  const listLocked = isEventItemsLocked(currentEvent?.status)

  const amIAttending = useMemo(() => {
    if (!currentEventId || !meId) return true
    const entry = rsvp.find(r => r.event_id === currentEventId && r.user_id === meId)
    return entry ? entry.attending : true
  }, [rsvp, currentEventId, meId])

  const amIAdmin = useMemo(
    () => members.find(m => m.user_id === meId)?.is_admin ?? false,
    [members, meId],
  )

  // Мои члены семьи в этой группе (только те, у кого owner_id === me)
  const myFamilyMembers = useMemo(
    () => familyMembers.filter(fm => fm.owner_id === meId),
    [familyMembers, meId],
  )

  const familyMemberAttending = useCallback(
    (familyMemberId: string): boolean => {
      if (!currentEventId) return true
      const entry = familyRsvp.find(
        r => r.family_member_id === familyMemberId && r.event_id === currentEventId,
      )
      return entry ? entry.attending : true
    },
    [familyRsvp, currentEventId],
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
  function toggleRsvp() {
    if (!currentEventId) return
    send({ type: 'event:rsvp', eventId: currentEventId, attending: !amIAttending })
  }

  function toggleFamilyRsvp(familyMemberId: string) {
    if (!currentEventId) return
    const current = familyMemberAttending(familyMemberId)
    send({ type: 'family:rsvp', familyMemberId, eventId: currentEventId, attending: !current })
  }

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

  const setScreen = useAppStore(s => s.setScreen)

  return {
    // data
    me, events, members, myItems, sorted, amIAdmin,
    // totals
    actualTotal, boughtItems, boughtCount, pct, listLocked,
    // rsvp (own + family)
    amIAttending, currentEvent, toggleRsvp,
    myFamilyMembers, familyMemberAttending, toggleFamilyRsvp,
    // scan
    scanOpen, setScanOpen,
    // actions
    toggleBought, updatePrice, changeQty, showLockedToast,
    setShowEventSheet,
    goToFamily: () => setScreen('family'),
    // utils
    fmt, currentEventId,
  }
}
