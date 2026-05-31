import { useState, useEffect } from 'react'

import { fmt } from '@shared/lib/session'
import { loadOpenCats, saveOpenCats } from '@shared/lib/ui-persist'
import { stepForUnit, fmtQty } from '@shared/lib/item-unit'
import { haptic } from '@shared/lib/tg'
import { isEventItemsLocked } from '@shared/lib/event-status'

import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

import type { Item } from '@shared/types'

export const UNITS  = ['шт','кг','л','г','мл','упак','наб','пуч','банк','меш','рул']
export const EMOJIS = ['🏡','🥩','🔥','🥗','🧃','🍽️','🍕','🍺','🥤','🍰','🫙','🌽','🥚','🧀','🥖','🧂','🫒','🍉','🍦','🎉','📦']

const sortByName = (list: Item[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }))

export function useListScreenVM() {
  const { serverState, send } = useWsStore()
  const me                = useSessionStore(s => s.me)
  const groupId           = useSessionStore(s => s.groupId)
  const showToast         = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [openCats,      setOpenCats]     = useState<Record<string, boolean>>({})
  const [addModal,      setAddModal]     = useState<string | null>(null)
  const [catModal,      setCatModal]     = useState(false)
  const [buyerModal,    setBuyerModal]   = useState<string | null>(null)
  const [selectedEmoji, setEmoji]        = useState('📦')
  const [newItem,       setNewItem]      = useState({ name: '', qty: '1', unit: 'шт' })
  const [newCat,        setNewCat]       = useState({ title: '' })
  const [customBuyer,   setCustomBuyer]  = useState('')
  const [confirmCat,    setConfirmCat]   = useState<{ id: string; title: string } | null>(null)
  const [actionItemId,  setActionItemId] = useState<string | null>(null)
  const [renamingId,    setRenamingId]   = useState<string | null>(null)
  const [renameTick,    setRenameTick]   = useState(0)

  // Undo-delete: id → setTimeout handle
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ── Persisted category open/closed state ─────────────────────────────────────
  useEffect(() => {
    if (!groupId) return
    setOpenCats(loadOpenCats(groupId, currentEventId))
  }, [groupId, currentEventId])

  useEffect(() => {
    if (!groupId) return
    saveOpenCats(groupId, currentEventId, openCats)
  }, [groupId, currentEventId, openCats])

  // ── Derived data ──────────────────────────────────────────────────────────────
  const { categories = [], items = [], members = [], events = [] } = serverState ?? {}
  const amIAdmin     = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const listLocked   = isEventItemsLocked(currentEvent?.status)

  const eventItems   = currentEventId ? items.filter(i => i.event_id === currentEventId) : items
  const visibleItems = eventItems.filter(i => !pendingDeletes.has(i.id))
  const listTotal    = visibleItems.reduce((s, i) => s + i.price * i.qty, 0)

  const actionItem   = actionItemId
    ? visibleItems.find(i => i.id === actionItemId) ?? null
    : null

  // ── Locked guard helper ───────────────────────────────────────────────────────
  function showLockedToast() {
    showToast('Событие завершено — список только для просмотра', 'muted')
  }

  // ── Item mutations ────────────────────────────────────────────────────────────
  function onUpdate(id: string, field: string, value: unknown) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field, value })
  }

  function requestDeleteItem(id: string) {
    if (listLocked) { showLockedToast(); return }
    const timer = setTimeout(() => {
      send({ type: 'item:delete', id })
      setPendingDeletes(m => { const n = new Map(m); n.delete(id); return n })
    }, 4000)

    setPendingDeletes(m => new Map(m).set(id, timer))

    showToast('Позиция удалена', 'error', {
      label: 'Отмена',
      fn: () => {
        clearTimeout(timer)
        setPendingDeletes(m => { const n = new Map(m); n.delete(id); return n })
      },
    })
  }

  function saveItem() {
    if (listLocked) { showLockedToast(); return }
    if (!newItem.name.trim()) return
    send({
      type: 'item:add', catId: addModal!, name: newItem.name.trim(),
      qty: parseFloat(newItem.qty) || 1, price: 0, unit: newItem.unit,
      eventId: currentEventId ?? undefined,
    })
    setNewItem({ name: '', qty: '1', unit: 'шт' })
    setAddModal(null)
    setOpenCats(p => ({ ...p, [addModal!]: true }))
    showToast('Добавлено!')
  }

  // ── Category mutations ────────────────────────────────────────────────────────
  function toggleCat(id: string) { setOpenCats(p => ({ ...p, [id]: !p[id] })) }

  function saveCat() {
    if (!newCat.title.trim()) return
    send({ type: 'cat:add', title: newCat.title.trim(), icon: selectedEmoji })
    setNewCat({ title: '' })
    setCatModal(false)
    showToast('Категория добавлена!')
  }

  // ── Buyer assignment ──────────────────────────────────────────────────────────
  function openBuyerModal(itemId: string) {
    setCustomBuyer('')
    setBuyerModal(itemId)
  }

  function handleBuyerTap(itemId: string) {
    if (listLocked) { showLockedToast(); return }
    const item = visibleItems.find(i => i.id === itemId)
    if (!item) return
    haptic()
    if (!item.buyer_id) {
      send({ type: 'item:update', id: itemId, field: 'buyer_id',   value: me?.id   ?? null })
      send({ type: 'item:update', id: itemId, field: 'buyer_name', value: me?.name ?? null })
    } else if (item.buyer_id === me?.id) {
      send({ type: 'item:update', id: itemId, field: 'buyer_id',   value: null })
      send({ type: 'item:update', id: itemId, field: 'buyer_name', value: null })
    } else {
      openBuyerModal(itemId)
    }
  }

  function assignBuyer(userId: string | null, name: string | null) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_id',   value: userId })
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_name', value: name   })
    setBuyerModal(null)
  }

  // ── Rename trigger ────────────────────────────────────────────────────────────
  function triggerRename(itemId: string) {
    setRenamingId(itemId)
    setRenameTick(t => t + 1)
    setActionItemId(null)
  }

  // ── Category sorted items ─────────────────────────────────────────────────────
  function catItems(catId: string) {
    return sortByName(visibleItems.filter(i => i.cat_id === catId))
  }

  return {
    // data
    events, categories, items, members, me, visibleItems, listTotal, actionItem,
    // state
    openCats, addModal, catModal, buyerModal, selectedEmoji,
    newItem, newCat, customBuyer, confirmCat, actionItemId, renamingId, renameTick,
    // derived
    amIAdmin, listLocked,
    // item actions
    onUpdate, requestDeleteItem, saveItem, handleBuyerTap, assignBuyer, triggerRename,
    // category actions
    toggleCat, saveCat,
    // setters for view
    setAddModal, setCatModal, setEmoji, setNewItem, setNewCat,
    setCustomBuyer, setConfirmCat, setActionItemId, setShowEventSheet,
    // helpers
    catItems, send, showLockedToast, fmt, stepForUnit, fmtQty,
    // constants
    UNITS, EMOJIS,
  }
}
