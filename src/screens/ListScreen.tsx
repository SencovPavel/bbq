import { useState, useRef, useEffect } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { Modal, ModalButtons, GlassInput, GlassSelect } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { fmt } from '../lib/session'
import { loadOpenCats, saveOpenCats } from '../lib/ui-persist'
import { stepForUnit, fmtQty } from '../lib/item-unit'
import { haptic } from '../lib/tg'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'
import { NoEventsPrompt } from '../components/NoEventsPrompt'
import { EmptyState } from '../components/states/EmptyState'
import { OfflineBanner } from '../components/states/OfflineBanner'
import { CompletedEventBanner } from '../components/states/CompletedEventBanner'
import { isEventItemsLocked } from '../lib/event-status'
import { ItemActionsSheet } from '../components/list/ItemActionsSheet'
import { IconDots, IconPerson, IconCart, IconTrash } from '../components/Icon'
import type { Item } from '../types'

const UNITS  = ['шт','кг','л','г','мл','упак','наб','пуч','банк','меш','рул']
const EMOJIS = ['🏡','🥩','🔥','🥗','🧃','🍽️','🍕','🍺','🥤','🍰','🫙','🌽','🥚','🧀','🥖','🧂','🫒','🍉','🍦','🎉','📦']

const sortItemsByName = (list: Item[]) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }))

type Source = 'chat' | 'agent' | 'manual'
const SOURCE_MAP: Record<Source, { bg: string; border: string; color: string; label: string }> = {
  chat:   { bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.25)',  color: '#93c5fd',        label: 'из чата'  },
  agent:  { bg: 'rgba(255,107,53,.12)', border: 'rgba(255,107,53,.25)', color: 'var(--accent2)', label: 'агент'    },
  manual: { bg: 'rgba(255,255,255,.06)',border: 'rgba(255,255,255,.14)',color: 'var(--muted)',   label: 'вручную'  },
}

function SourceBadge({ source }: { source: Source }) {
  const s = SOURCE_MAP[source] ?? SOURCE_MAP.manual
  return (
    <span className="inline-flex items-center rounded-full text-[10px] font-bold ml-1 align-middle"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '1px 7px' }}>
      {s.label}
    </span>
  )
}

interface ItemRowProps {
  item: Item
  meId?: string
  readOnly?: boolean
  onUpdate: (id: string, field: string, value: unknown) => void
  onBuyerTap: (id: string) => void
  onOpenActions: (id: string) => void
  renameTrigger: number
}

const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1 || value === '1') return true
  if (value === 'false' || value === 0 || value === '0') return false
  return Boolean(value)
}

function ItemRow({ item, meId, readOnly = false, onUpdate, onBuyerTap, onOpenActions, renameTrigger }: ItemRowProps) {
  // ── qty: local optimistic state + debounce ──
  const [localQty, setLocalQty] = useState(() => Number(item.qty) || 0)
  const qtyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingQty = useRef<number | null>(null)

  useEffect(() => {
    pendingQty.current = null
    setLocalQty(Number(item.qty) || 0)
  }, [item.id])

  useEffect(() => {
    const serverQty = Number(item.qty) || 0
    if (pendingQty.current !== null) {
      if (serverQty === pendingQty.current) {
        pendingQty.current = null
        setLocalQty(serverQty)
      }
      return
    }
    if (!qtyTimer.current) {
      setLocalQty(serverQty)
    }
  }, [item.qty])

  useEffect(() => () => {
    if (qtyTimer.current) clearTimeout(qtyTimer.current)
  }, [])

  // ── name: inline edit ──
  const [editing,  setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setEditName(item.name)
  }, [item.name, editing])

  useEffect(() => {
    if (renameTrigger > 0) startEdit()
  }, [renameTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit() {
    if (readOnly) return
    setEditing(true)
    setTimeout(() => nameRef.current?.focus(), 0)
  }

  function commitEdit() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== item.name) onUpdate(item.id, 'name', trimmed)
    else setEditName(item.name)
    setEditing(false)
  }

  function cancelEdit() {
    setEditName(item.name)
    setEditing(false)
  }

  const step = stepForUnit(item.unit)
  const lineTotal = item.price * localQty

  const changeQtyByStep = (delta: number) => {
    if (readOnly) return
    haptic()
    const next = Math.max(0, +(Number(localQty) + delta).toFixed(2))
    setLocalQty(next)
    pendingQty.current = next
    if (qtyTimer.current) clearTimeout(qtyTimer.current)
    qtyTimer.current = setTimeout(() => {
      onUpdate(item.id, 'qty', next)
      qtyTimer.current = null
    }, 400)
  }

  const isMe      = !!(meId && item.buyer_id === meId)
  const hasOther  = !!(item.buyer_id && !isMe)

  return (
    <div className="px-3.5 py-2.5">
      {/* Row 1: name + assign chip */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          {editing ? (
            <input
              ref={nameRef}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
                if (e.key === 'Escape') cancelEdit()
              }}
              className="glass-input text-md font-extrabold rounded-sm flex-1"
              style={{
                minWidth: 0,
                padding: '2px 8px',
                border: '1px solid var(--accent)',
                background: 'rgba(249,115,22,.08)',
                color: 'var(--text)',
              }}
            />
          ) : (
            <span
              className={`text-md font-extrabold leading-tight tracking-tight ${readOnly ? '' : 'cursor-text'}`}
              onClick={startEdit}
            >
              {item.name}
            </span>
          )}
          {!editing && <SourceBadge source={item.source} />}
        </div>

        <button
          type="button"
          onClick={() => { if (!readOnly) onBuyerTap(item.id) }}
          disabled={readOnly}
          className="inline-flex items-center gap-1 rounded-pill text-xs font-extrabold shrink-0 border"
          style={{
            padding: '3px 8px',
            background: isMe ? 'rgba(249,115,22,.15)' : 'transparent',
            borderColor: isMe ? 'rgba(249,115,22,.4)' : 'var(--gb)',
            color: isMe ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'inherit',
            cursor: readOnly ? 'default' : 'pointer',
            opacity: readOnly ? 0.7 : 1,
          }}
        >
          {isMe
            ? <>✓ Я</>
            : item.buyer_name
              ? <><IconPerson size={10} strokeWidth={2} /> {item.buyer_name}</>
              : '＋ Взять'}
        </button>
      </div>

      {/* Row 2: qty + price + dots */}
      <div className="flex items-center gap-2">

        <div
          className="flex items-center shrink-0 rounded-sm p-px"
          style={{ background: 'rgba(255,240,200,.04)', border: '1px solid var(--gb)' }}
        >
          <button
            type="button"
            onClick={() => changeQtyByStep(-step)}
            disabled={readOnly}
            className="size-[22px] border-none bg-transparent text-sm flex items-center justify-center"
            style={{ color: 'var(--text)', fontFamily: 'inherit', cursor: readOnly ? 'default' : 'pointer', opacity: readOnly ? 0.5 : 1 }}
          >
            −
          </button>
          <span className="text-sm font-extrabold px-2 min-w-[50px] text-center tabular-nums">
            {fmtQty(localQty, item.unit)}{' '}
            <span className="font-semibold text-xs" style={{ color: 'var(--muted)' }}>
              {item.unit}
            </span>
          </span>
          <button
            type="button"
            onClick={() => changeQtyByStep(step)}
            disabled={readOnly}
            className="size-[22px] border-none bg-transparent text-sm flex items-center justify-center"
            style={{ color: 'var(--text)', fontFamily: 'inherit', cursor: readOnly ? 'default' : 'pointer', opacity: readOnly ? 0.5 : 1 }}
          >
            +
          </button>
        </div>

        <div
          className="ml-auto text-sm font-black tabular-nums shrink-0"
          style={{ color: item.price > 0 ? 'var(--accent)' : 'var(--muted)' }}
        >
          {item.price > 0 ? fmt(lineTotal) : '—'}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => onOpenActions(item.id)}
            className="size-6 rounded-sm border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0"
            style={{ color: 'var(--muted)' }}
            title="Ещё"
          >
            <IconDots />
          </button>
        )}
      </div>
    </div>
  )
}

export function ListScreen() {
  const { serverState, send, wsOk } = useWsStore()
  const me             = useSessionStore(s => s.me)
  const groupId        = useSessionStore(s => s.groupId)
  const showToast      = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const [addModal,    setAddModal]    = useState<string | null>(null)
  const [catModal,    setCatModal]    = useState(false)
  const [buyerModal,  setBuyerModal]  = useState<string | null>(null)
  const [selectedEmoji, setEmoji]     = useState('📦')
  const [newItem,     setNewItem]     = useState({ name: '', qty: '1', unit: 'шт' })
  const [newCat,      setNewCat]      = useState({ title: '' })
  const [customBuyer, setCustomBuyer] = useState('')
  const [confirmCat,  setConfirmCat]  = useState<{ id: string; title: string } | null>(null)
  const [actionItemId, setActionItemId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameTick, setRenameTick] = useState(0)

  // Undo-удаление позиций: id → таймер реального send
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const { categories = [], items = [], members = [], events = [] } = serverState ?? {}
  const amIAdmin = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const listLocked = isEventItemsLocked(currentEvent?.status)

  const showLockedToast = () => {
    showToast('Событие завершено — список только для просмотра', 'muted')
  }

  useEffect(() => {
    if (!groupId) return
    setOpenCats(loadOpenCats(groupId, currentEventId))
  }, [groupId, currentEventId])

  useEffect(() => {
    if (!groupId) return
    saveOpenCats(groupId, currentEventId, openCats)
  }, [groupId, currentEventId, openCats])

  // Фильтруем по текущему событию
  const eventItems = currentEventId
    ? items.filter(i => i.event_id === currentEventId)
    : items

  // Скрываем позиции, ожидающие удаления
  const visibleItems = eventItems.filter(i => !pendingDeletes.has(i.id))

  function toggleCat(id: string) { setOpenCats(p => ({ ...p, [id]: !p[id] })) }

  function onUpdate(id: string, field: string, value: unknown) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field, value })
  }

  function requestDeleteItem(id: string) {
    if (listLocked) { showLockedToast(); return }
    // Оптимистично скрываем, запускаем таймер
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
    send({ type: 'item:add', catId: addModal!, name: newItem.name.trim(),
           qty: parseFloat(newItem.qty) || 1, price: 0, unit: newItem.unit,
           eventId: currentEventId ?? undefined })
    setNewItem({ name: '', qty: '1', unit: 'шт' })
    setAddModal(null)
    setOpenCats(p => ({ ...p, [addModal!]: true }))
    showToast('Добавлено!')
  }

  function saveCat() {
    if (!newCat.title.trim()) return
    send({ type: 'cat:add', title: newCat.title.trim(), icon: selectedEmoji })
    setNewCat({ title: '' })
    setCatModal(false)
    showToast('Категория добавлена!')
  }

  function openBuyer(itemId: string) {
    setCustomBuyer('')
    setBuyerModal(itemId)
  }

  function handleBuyerTap(itemId: string) {
    if (listLocked) { showLockedToast(); return }
    const item = visibleItems.find(i => i.id === itemId)
    if (!item) return
    haptic()
    if (!item.buyer_id) {
      // Никто не берёт → назначаю себя
      send({ type: 'item:update', id: itemId, field: 'buyer_id',   value: me?.id   ?? null })
      send({ type: 'item:update', id: itemId, field: 'buyer_name', value: me?.name ?? null })
    } else if (item.buyer_id === me?.id) {
      // Моё → снять
      send({ type: 'item:update', id: itemId, field: 'buyer_id',   value: null })
      send({ type: 'item:update', id: itemId, field: 'buyer_name', value: null })
    } else {
      // Чужое → открыть модалку
      openBuyer(itemId)
    }
  }

  function assignBuyer(userId: string | null, name: string | null) {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_id',   value: userId })
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_name', value: name   })
    setBuyerModal(null)
  }

  const actionItem = actionItemId ? visibleItems.find(i => i.id === actionItemId) ?? null : null

  const listTotal = visibleItems.reduce((s, i) => s + i.price * i.qty, 0)

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        {!wsOk && <OfflineBanner />}
        <NoEventsPrompt
          isAdmin={amIAdmin}
          onCreate={() => setShowEventSheet(true)}
        />
      </div>
    )
  }

  return (
    <div className="px-3.5 pt-2 pb-8 relative">
      {!wsOk && <OfflineBanner />}
      {listLocked && <CompletedEventBanner />}

      {categories.length > 0 && (
        <div
          className="flex items-center justify-between mb-3 px-0.5"
          aria-label="Сумма по списку"
        >
          <span
            className="text-[11px] font-extrabold uppercase tracking-wider"
            style={{ color: 'var(--muted)' }}
          >
            По списку
          </span>
          <span
            className="text-sm font-black tabular-nums tracking-tight"
            style={{ color: listTotal > 0 ? 'var(--accent)' : 'var(--muted)' }}
          >
            {listTotal > 0 ? fmt(listTotal) : `${visibleItems.length} поз.`}
          </span>
        </div>
      )}

      {categories.length === 0 && !listLocked && (
        <EmptyState
          icon={<IconCart size={56} strokeWidth={1.4} />}
          title="Список пустой"
          body="Добавь категорию — например «Мясо» или «Напитки», и начни собирать список"
          ctaLabel="＋ Первая категория"
          onCta={() => { setEmoji('📦'); setCatModal(true) }}
        />
      )}

      {categories.map(cat => {
        const catItems = sortItemsByName(visibleItems.filter(i => i.cat_id === cat.id))
        const isOpen   = openCats[cat.id] !== false

        return (
          <GlassCard key={cat.id}>
            <div className="flex items-center gap-[10px] px-[15px] py-[13px] cursor-pointer select-none"
              onClick={() => toggleCat(cat.id)}>
              <div className="flex items-center justify-center rounded-[10px] text-[18px] flex-shrink-0"
                style={{ width: 36, height: 36, background: 'rgba(255,255,255,.08)', border: '1px solid var(--gbs)' }}>
                {cat.icon}
              </div>
              <div className="text-[14px] font-extrabold flex-1">{cat.title}</div>
              <button
                onClick={e => { e.stopPropagation(); if (!listLocked) setConfirmCat({ id: cat.id, title: cat.title }) }}
                className="cursor-pointer border-none bg-transparent px-1 rounded flex items-center"
                style={{ color: 'var(--muted)', visibility: listLocked ? 'hidden' : 'visible' }}>
                <IconTrash size={14} />
              </button>
              <span style={{ color: 'var(--muted)', fontSize: 11, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .25s' }}>▶</span>
            </div>

            {isOpen && (
              <>
                {catItems.length === 0 && (
                  <div className="py-5 text-center text-[12px]" style={{ color: 'var(--muted)' }}>
                    Пусто — добавь первую позицию ↓
                  </div>
                )}
                {catItems.map(it => (
                  <div key={it.id}>
                    <Divider />
                    <ItemRow
                      item={it}
                      meId={me?.id}
                      readOnly={listLocked}
                      onUpdate={onUpdate}
                      onBuyerTap={handleBuyerTap}
                      onOpenActions={setActionItemId}
                      renameTrigger={it.id === renamingId ? renameTick : 0}
                    />
                  </div>
                ))}
                {!listLocked && (
                  <>
                    <Divider />
                    <button onClick={() => setAddModal(cat.id)}
                      className="w-full py-[10px] border-none bg-transparent text-[12px] font-bold flex items-center justify-center gap-[5px] cursor-pointer"
                      style={{ borderTop: '1px dashed rgba(255,255,255,.1)', color: 'var(--muted)', fontFamily: 'inherit' }}>
                      ＋ Добавить в «{cat.title}»
                    </button>
                  </>
                )}
              </>
            )}
          </GlassCard>
        )
      })}

      {categories.length > 0 && !listLocked && (
        <button onClick={() => { setEmoji('📦'); setCatModal(true) }}
          className="w-full py-[13px] rounded-[14px] border-none text-[13px] font-bold flex items-center justify-center gap-[6px] cursor-pointer mb-[10px]"
          style={{ background: 'var(--g)', border: '1px dashed var(--gb)', color: 'var(--muted)', fontFamily: 'inherit' }}>
          ＋ Добавить категорию
        </button>
      )}

      {/* Add item modal */}
      <Modal open={!!addModal} onClose={() => setAddModal(null)} title="Добавить позицию">
        <GlassInput label="Название" value={newItem.name}
          onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
          placeholder="Шашлык из курицы" autoFocus />
        <div className="grid grid-cols-2 gap-[10px]">
          <GlassInput label="Кол-во" type="number" min="0" step="0.5"
            value={newItem.qty} onChange={e => setNewItem(p => ({ ...p, qty: e.target.value }))} />
          <GlassSelect label="Единица" value={newItem.unit}
            onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </GlassSelect>
        </div>
        <ModalButtons onCancel={() => setAddModal(null)} onConfirm={saveItem} confirmText="Добавить" />
      </Modal>

      {/* Add category modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Новая категория">
        <GlassInput label="Название" value={newCat.title}
          onChange={e => setNewCat({ title: e.target.value })} placeholder="Например: Сладкое" autoFocus />
        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Иконка</div>
        <div className="grid gap-[6px] mb-3" style={{ gridTemplateColumns: 'repeat(8,1fr)' }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setEmoji(em)}
              className="text-xl p-[6px] rounded-[8px] cursor-pointer border-none text-center"
              style={{
                background: 'rgba(255,255,255,.08)',
                border: selectedEmoji === em ? '1px solid var(--accent)' : '1px solid transparent',
                fontFamily: 'inherit',
              }}>
              {em}
            </button>
          ))}
        </div>
        <ModalButtons onCancel={() => setCatModal(false)} onConfirm={saveCat} confirmText="Создать" />
      </Modal>

      {/* Confirm delete category */}
      <ConfirmModal
        open={!!confirmCat}
        message={confirmCat ? `Удалить категорию «${confirmCat.title}» и все её позиции?` : ''}
        confirmText="Удалить"
        onConfirm={() => { if (confirmCat) send({ type: 'cat:delete', id: confirmCat.id }); setConfirmCat(null) }}
        onCancel={() => setConfirmCat(null)}
      />

      <ItemActionsSheet
        item={actionItem}
        onClose={() => setActionItemId(null)}
        onRename={() => {
          if (actionItem) {
            setRenamingId(actionItem.id)
            setRenameTick(t => t + 1)
            setActionItemId(null)
          }
        }}
        onDelete={requestDeleteItem}
        onShare={(it) => {
          const text = `${it.name} — ${it.qty} ${it.unit}`
          if (navigator.share) navigator.share({ text }).catch(() => {})
          else navigator.clipboard?.writeText(text).then(() => showToast('Скопировано'))
        }}
      />

      {/* Buyer modal */}
      <Modal open={!!buyerModal} onClose={() => setBuyerModal(null)} title="Кто купит?">
        <div className="grid gap-[7px] mb-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {members.map(m => {
            const it     = items.find(i => i.id === buyerModal)
            const active = it?.buyer_id === m.user_id
            return (
              <button key={m.user_id} onClick={() => assignBuyer(m.user_id, m.name)}
                className="py-[9px] px-1 rounded-[10px] text-[12px] font-bold cursor-pointer border-none text-center"
                style={{
                  background: active ? 'var(--accent)' : 'rgba(255,255,255,.08)',
                  border:     active ? '1px solid var(--accent)' : '1px solid var(--gb)',
                  color:      active ? '#fff' : 'var(--text)', fontFamily: 'inherit',
                }}>
                {m.name}{m.user_id === me?.id ? ' (я)' : ''}
              </button>
            )
          })}
        </div>
        <GlassInput label="Или введите вручную" value={customBuyer}
          onChange={e => setCustomBuyer(e.target.value)} placeholder="Имя" />
        <ModalButtons
          onCancel={() => assignBuyer(null, null)}
          onConfirm={() => assignBuyer(customBuyer ? 'custom_' + customBuyer : null, customBuyer || null)}
          cancelText="Никто" confirmText="Готово" />
      </Modal>
    </div>
  )
}
