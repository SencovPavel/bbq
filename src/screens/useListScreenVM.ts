import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

import { fmt } from '@shared/lib/session'
import { loadOpenCats, saveOpenCats } from '@shared/lib/ui-persist'
import { haptic } from '@shared/lib/tg'

import { isEventItemsLocked, selectCurrentEvent, selectHasBudget, LIST_LOCKED_MESSAGE } from '@entities/event/model'
import { stepForUnit, fmtQty, selectEventItems } from '@entities/item/model'
import { selectAmIAdmin } from '@entities/member/model'

import { useWsStore } from '@stores/wsStore'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore } from '@stores/appStore'
import { useToastStore } from '@stores/toastStore'

import type { Item } from '@shared/types'
import type { AddItemPayload } from '@widgets/AddItemModal'

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
  const [newCat,        setNewCat]       = useState({ title: '' })
  const [customBuyer,   setCustomBuyer]  = useState('')
  const [confirmCat,    setConfirmCat]   = useState<{ id: string; title: string } | null>(null)
  const [actionItemId,  setActionItemId] = useState<string | null>(null)
  const [priceModalItemId, setPriceModalItemId] = useState<string | null>(null)
  const [priceInput,       setPriceInput]       = useState('')
  const [moveModalItemId,  setMoveModalItemId]  = useState<string | null>(null)
  const [renamingId,    setRenamingId]   = useState<string | null>(null)
  const [renameTick,    setRenameTick]   = useState(0)

  // Undo-delete: id → setTimeout handle
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Держим актуальные таймеры в ref, чтобы очистить их при размонтировании
  const pendingDeletesRef = useRef(pendingDeletes)
  useEffect(() => { pendingDeletesRef.current = pendingDeletes }, [pendingDeletes])
  useEffect(() => () => {
    pendingDeletesRef.current.forEach(timer => clearTimeout(timer))
  }, [])

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
  const meId = me?.id

  const amIAdmin = useMemo(
    () => selectAmIAdmin(members, meId),
    [members, meId],
  )

  const currentEvent = useMemo(
    () => selectCurrentEvent(events, currentEventId),
    [events, currentEventId],
  )

  const listLocked = isEventItemsLocked(currentEvent?.status)
  const hasBudget  = selectHasBudget(currentEvent)

  const eventItems = useMemo(
    () => selectEventItems(items, currentEventId),
    [items, currentEventId],
  )

  const visibleItems = useMemo(
    () => eventItems.filter(i => !pendingDeletes.has(i.id)),
    [eventItems, pendingDeletes],
  )

  const listTotal = useMemo(
    () => visibleItems.reduce((s, i) => s + i.price * i.qty, 0),
    [visibleItems],
  )

  const actionItem = useMemo(
    () => actionItemId ? visibleItems.find(i => i.id === actionItemId) ?? null : null,
    [actionItemId, visibleItems],
  )

  // ── Locked guard helper ───────────────────────────────────────────────────────
  function showLockedToast() {
    showToast(LIST_LOCKED_MESSAGE, 'muted')
  }

  // ── Item mutations ────────────────────────────────────────────────────────────
  function onUpdate(id: string, field: string, value: unknown) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field, value })
  }

  function openPriceModal(id: string) {
    if (listLocked) { showLockedToast(); return }
    const item = visibleItems.find(i => i.id === id)
    setPriceInput(item?.price ? String(item.price) : '')
    setPriceModalItemId(id)
  }

  function savePrice() {
    if (!priceModalItemId) return
    const price = parseFloat(priceInput.replace(',', '.')) || 0
    send({ type: 'item:update', id: priceModalItemId, field: 'price', value: price })
    setPriceModalItemId(null)
  }

  function openMoveModal(id: string) {
    if (listLocked) { showLockedToast(); return }
    setMoveModalItemId(id)
  }

  function moveToCategory(catId: string) {
    if (!moveModalItemId) return
    send({ type: 'item:update', id: moveModalItemId, field: 'cat_id', value: catId })
    setMoveModalItemId(null)
    showToast('Перемещено!')
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

  function saveItem(payload: AddItemPayload) {
    if (listLocked) { showLockedToast(); return }
    send({
      type: 'item:add', catId: payload.catId, name: payload.name,
      qty: payload.qty, price: 0, unit: payload.unit,
      kind: payload.kind,
      eventId: currentEventId ?? undefined,
    })
    setAddModal(null)
    setOpenCats(p => ({ ...p, [payload.catId]: true }))
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

  // ── Share single item ─────────────────────────────────────────────────────────
  function shareItem(item: Item) {
    const text = `${item.name} — ${fmtQty(item.qty, item.unit)}`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
      return
    }
    navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
  }

  // ── Rename trigger ────────────────────────────────────────────────────────────
  function triggerRename(itemId: string) {
    setRenamingId(itemId)
    setRenameTick(t => t + 1)
    setActionItemId(null)
  }

  // ── Category sorted items ─────────────────────────────────────────────────────
  const catItems = useCallback(
    (catId: string) => sortByName(visibleItems.filter(i => i.cat_id === catId)),
    [visibleItems],
  )

  return {
    // data
    events, categories, items, members, me, visibleItems, listTotal, actionItem,
    // state
    openCats, addModal, catModal, buyerModal, selectedEmoji,
    newCat, customBuyer, confirmCat, actionItemId, renamingId, renameTick,
    priceModalItemId, priceInput, moveModalItemId,
    // derived
    amIAdmin, listLocked, hasBudget,
    // item actions
    onUpdate, requestDeleteItem, saveItem, handleBuyerTap, assignBuyer, triggerRename, shareItem,
    openPriceModal, savePrice, setPriceInput, setPriceModalItemId,
    openMoveModal, moveToCategory, setMoveModalItemId,
    // category actions
    toggleCat, saveCat,
    // setters for view
    setAddModal, setCatModal, setEmoji, setNewCat,
    setCustomBuyer, setConfirmCat, setActionItemId, setShowEventSheet,
    // helpers
    catItems, send, showLockedToast, fmt, stepForUnit, fmtQty,
    // constants
    EMOJIS,
  }
}
