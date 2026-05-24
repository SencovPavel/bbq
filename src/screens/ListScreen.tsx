import { useState, useRef, useEffect } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { Modal, ModalButtons, GlassInput, GlassSelect } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { PriceCell } from '../components/PriceCell'
import { fmt } from '../lib/session'
import { haptic } from '../lib/tg'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'
import { IconTrash, IconPerson, IconCalendar, IconCart } from '../components/Icon'
import type { Item, Member } from '../types'

const UNITS  = ['шт','кг','л','г','мл','упак','наб','пуч','банк','меш','рул']
const EMOJIS = ['🏡','🥩','🔥','🥗','🧃','🍽️','🍕','🍺','🥤','🍰','🫙','🌽','🥚','🧀','🥖','🧂','🫒','🍉','🍦','🎉','📦']

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
  members: Member[]
  onUpdate: (id: string, field: string, value: unknown) => void
  onDeleteRequest: (id: string) => void
  onBuyerOpen: (id: string) => void
}

function ItemRow({ item, onUpdate, onDeleteRequest, onBuyerOpen }: ItemRowProps) {
  // ── qty: local optimistic state + debounce ──
  const [localQty, setLocalQty] = useState(item.qty)
  const qtyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!qtyTimer.current) setLocalQty(item.qty)
  }, [item.qty])

  function changeQty(delta: number) {
    haptic()
    const next = Math.max(0, +(localQty + delta).toFixed(2))
    setLocalQty(next)
    if (qtyTimer.current) clearTimeout(qtyTimer.current)
    qtyTimer.current = setTimeout(() => {
      onUpdate(item.id, 'qty', next)
      qtyTimer.current = null
    }, 400)
  }

  // ── name: inline edit ──
  const [editing,  setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setEditName(item.name)
  }, [item.name, editing])

  function startEdit() {
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

  return (
    <div className="px-[15px] py-[12px]" style={{ opacity: item.enabled ? 1 : 0.4, transition: 'opacity .2s' }}>

      {/* Строка 1: название + тогл */}
      <div className="flex items-center justify-between gap-3 mb-[8px]">
        <div className="flex-1 min-w-0 flex items-center gap-1 flex-wrap">
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
              className="glass-input text-[14px] font-bold rounded-[8px] flex-1"
              style={{ minWidth: 0, padding: '2px 8px',
                border: '1px solid var(--accent)', background: 'rgba(249,115,22,.08)', color: 'var(--text)' }}
            />
          ) : (
            <span
              className="text-[14px] font-bold leading-tight cursor-text"
              style={{ textDecoration: item.enabled ? 'none' : 'line-through', color: 'var(--text)' }}
              onClick={startEdit}
              title="Нажмите чтобы изменить"
            >
              {item.name}
            </span>
          )}
          {!editing && <SourceBadge source={item.source} />}
        </div>
        <div className={`toggle${item.enabled ? ' on' : ''}`}
          onClick={() => { haptic(); onUpdate(item.id, 'enabled', !item.enabled) }} />
      </div>

      {/* Строка 2: степпер + цена + удалить */}
      <div className="flex items-center gap-[8px]">
        <button onClick={() => changeQty(-0.5)}
          className="flex items-center justify-center cursor-pointer border-none flex-shrink-0"
          style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--g)', border: '1px solid var(--gbs)', color: 'var(--text)', fontSize: 15 }}>
          −
        </button>
        <span className="text-[13px] font-bold" style={{ minWidth: 40, textAlign: 'center' }}>
          {localQty} {item.unit}
        </span>
        <button onClick={() => changeQty(+0.5)}
          className="flex items-center justify-center cursor-pointer border-none flex-shrink-0"
          style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--g)', border: '1px solid var(--gbs)', color: 'var(--text)', fontSize: 15 }}>
          +
        </button>

        {/* Цена прямо в строке */}
        <div className="flex items-center gap-[4px] ml-auto">
          <PriceCell item={item} onChange={(id, price) => onUpdate(id, 'price', price)} />
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>₽/{item.unit}</span>
        </div>

        <button onClick={() => { haptic('medium'); onDeleteRequest(item.id) }}
          className="cursor-pointer border-none bg-transparent p-[3px] flex-shrink-0 flex items-center"
          style={{ color: 'var(--muted)' }}>
          <IconTrash size={14} />
        </button>
      </div>

      {/* Строка 3: покупатель */}
      <button onClick={() => onBuyerOpen(item.id)}
        className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold cursor-pointer border-none mt-[8px]"
        style={{
          background: item.buyer_name ? 'rgba(249,115,22,.15)' : 'transparent',
          border: `1px solid ${item.buyer_name ? 'rgba(249,115,22,.3)' : 'var(--gb)'}`,
          color: item.buyer_name ? 'var(--accent)' : 'var(--muted)',
          padding: '3px 10px', fontFamily: 'inherit',
        }}>
        {item.buyer_name
          ? <><IconPerson size={11} strokeWidth={2} /> {item.buyer_name}</>
          : '+ Кто купит?'
        }
      </button>
    </div>
  )
}

export function ListScreen() {
  const { serverState, send } = useWsStore()
  const meId          = useSessionStore(s => s.me?.id)
  const showToast     = useToastStore(s => s.show)
  const currentEventId = useAppStore(s => s.currentEventId)

  const [openCats,    setOpenCats]    = useState<Record<string, boolean>>({ rent: true, meat: true })
  const [addModal,    setAddModal]    = useState<string | null>(null)
  const [catModal,    setCatModal]    = useState(false)
  const [buyerModal,  setBuyerModal]  = useState<string | null>(null)
  const [selectedEmoji, setEmoji]     = useState('📦')
  const [newItem,     setNewItem]     = useState({ name: '', qty: '1', unit: 'шт' })
  const [newCat,      setNewCat]      = useState({ title: '' })
  const [customBuyer, setCustomBuyer] = useState('')
  const [confirmCat,  setConfirmCat]  = useState<{ id: string; title: string } | null>(null)

  // Undo-удаление позиций: id → таймер реального send
  const [pendingDeletes, setPendingDeletes] = useState<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const { categories = [], items = [], members = [] } = serverState ?? {}

  // Фильтруем по текущему событию
  const eventItems = currentEventId
    ? items.filter(i => i.event_id === currentEventId)
    : items

  // Скрываем позиции, ожидающие удаления
  const visibleItems = eventItems.filter(i => !pendingDeletes.has(i.id))

  function toggleCat(id: string) { setOpenCats(p => ({ ...p, [id]: !p[id] })) }

  function onUpdate(id: string, field: string, value: unknown) {
    send({ type: 'item:update', id, field, value })
  }

  function requestDeleteItem(id: string) {
    // Оптимистично скрываем, запускаем таймер
    const timer = setTimeout(() => {
      send({ type: 'item:delete', id })
      setPendingDeletes(m => { const n = new Map(m); n.delete(id); return n })
    }, 4000)

    setPendingDeletes(m => new Map(m).set(id, timer))

    showToast('Позиция удалена', 'var(--red)', {
      label: 'Отмена',
      fn: () => {
        clearTimeout(timer)
        setPendingDeletes(m => { const n = new Map(m); n.delete(id); return n })
      },
    })
  }

  function saveItem() {
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

  function assignBuyer(userId: string | null, name: string | null) {
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_id',   value: userId })
    send({ type: 'item:update', id: buyerModal!, field: 'buyer_name', value: name   })
    setBuyerModal(null)
  }

  return (
    <div className="px-[14px] pt-2 pb-8 relative">

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4" style={{ color: 'var(--muted)', opacity: 0.45 }}><IconCart size={56} /></div>
          <div className="text-[17px] font-extrabold mb-2">Список пустой</div>
          <div className="text-[13px] leading-relaxed mb-6" style={{ color: 'var(--muted)', maxWidth: 260 }}>
            Добавь категорию — например «Мясо» или «Напитки», и начни собирать список
          </div>
          <button
            onClick={() => { setEmoji('📦'); setCatModal(true) }}
            className="px-6 py-[13px] rounded-[14px] text-[14px] font-extrabold cursor-pointer border-none"
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}
          >
            ＋ Первая категория
          </button>
        </div>
      )}

      {categories.map(cat => {
        const catItems = visibleItems.filter(i => i.cat_id === cat.id)
        const total    = catItems.filter(i => i.enabled).reduce((s, i) => s + i.price * i.qty, 0)
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
              {total > 0 && <div className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>{fmt(total)}</div>}
              <button
                onClick={e => { e.stopPropagation(); setConfirmCat({ id: cat.id, title: cat.title }) }}
                className="cursor-pointer border-none bg-transparent px-1 rounded flex items-center"
                style={{ color: 'var(--muted)' }}>
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
                    <ItemRow item={it} members={members}
                      onUpdate={onUpdate} onDeleteRequest={requestDeleteItem} onBuyerOpen={openBuyer} />
                  </div>
                ))}
                <Divider />
                <button onClick={() => setAddModal(cat.id)}
                  className="w-full py-[10px] border-none bg-transparent text-[12px] font-bold flex items-center justify-center gap-[5px] cursor-pointer"
                  style={{ borderTop: '1px dashed rgba(255,255,255,.1)', color: 'var(--muted)', fontFamily: 'inherit' }}>
                  ＋ Добавить в «{cat.title}»
                </button>
              </>
            )}
          </GlassCard>
        )
      })}

      {categories.length > 0 && (
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
                {m.name}{m.user_id === meId ? ' (я)' : ''}
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
