import { useState } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { Modal, ModalButtons, GlassInput, GlassSelect } from '../components/Modal'
import { fmt } from '../lib/session'
import { haptic } from '../lib/tg'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useToastStore } from '../stores/toastStore'
import type { Item, Member } from '../types'

const UNITS  = ['шт','кг','л','г','мл','упак','наб','пуч','банк','меш','рул']
const EMOJIS = ['🏡','🥩','🔥','🥗','🧃','🍽️','🍕','🍺','🥤','🍰','🫙','🌽','🥚','🧀','🥖','🧂','🫒','🍉','🍦','🎉','📦']

type Source = 'chat' | 'agent' | 'manual'
const SOURCE_MAP: Record<Source, { bg: string; border: string; color: string; label: string }> = {
  chat:   { bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.25)',  color: '#93c5fd',        label: '💬 из чата'  },
  agent:  { bg: 'rgba(255,107,53,.12)', border: 'rgba(255,107,53,.25)', color: 'var(--accent2)', label: '🤖 агент'    },
  manual: { bg: 'rgba(255,255,255,.06)',border: 'rgba(255,255,255,.14)',color: 'var(--muted)',   label: '✏️ вручную' },
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
  onDelete: (id: string) => void
  onBuyerOpen: (id: string) => void
}

function ItemRow({ item, onUpdate, onDelete, onBuyerOpen }: ItemRowProps) {
  const price = item.price
  const qty   = item.qty

  return (
    <div className="grid gap-2 px-[15px] py-[11px]" style={{ gridTemplateColumns: '1fr auto' }}>
      <div>
        <div className="text-[13px] font-bold mb-[2px]">
          {item.name}
          <SourceBadge source={item.source} />
        </div>
        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
          {qty} {item.unit}
          {price > 0 && <span style={{ color: 'var(--accent2)', marginLeft: 6 }}>{fmt(price)}/{item.unit}</span>}
          {!price && <span style={{ marginLeft: 6 }}>· цена не указана</span>}
          {item.chat_hint && <span style={{ fontStyle: 'italic', marginLeft: 6 }}>"{item.chat_hint}"</span>}
        </div>
        <button
          onClick={() => onBuyerOpen(item.id)}
          className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold cursor-pointer border-none mt-[5px]"
          style={{
            background: item.buyer_name ? 'rgba(255,107,53,.15)' : 'var(--g)',
            border: `1px solid ${item.buyer_name ? 'rgba(255,107,53,.3)' : 'var(--gb)'}`,
            color: item.buyer_name ? 'var(--accent)' : 'var(--muted)',
            padding: '2px 8px', fontFamily: 'inherit',
          }}>
          {item.buyer_name ? `👤 ${item.buyer_name}` : '+ Кто купит?'}
        </button>
      </div>
      <div className="flex flex-col items-end gap-[5px]">
        <div className="flex items-center gap-[5px]">
          <button onClick={() => { haptic(); onUpdate(item.id, 'qty', Math.max(0, +(qty - 0.5).toFixed(2))) }}
            className="flex items-center justify-center rounded-[7px] text-[15px] cursor-pointer border-none"
            style={{ width: 26, height: 26, background: 'rgba(255,255,255,.08)', border: '1px solid var(--gbs)', color: 'var(--text)' }}>
            −
          </button>
          <span className="text-[13px] font-bold text-center" style={{ minWidth: 28 }}>{qty}</span>
          <button onClick={() => { haptic(); onUpdate(item.id, 'qty', +(qty + 0.5).toFixed(2)) }}
            className="flex items-center justify-center rounded-[7px] text-[15px] cursor-pointer border-none"
            style={{ width: 26, height: 26, background: 'rgba(255,255,255,.08)', border: '1px solid var(--gbs)', color: 'var(--text)' }}>
            +
          </button>
        </div>
        <div
          className={`toggle${item.enabled ? ' on' : ''}`}
          onClick={() => onUpdate(item.id, 'enabled', !item.enabled)}
        />
        <button onClick={() => { haptic('medium'); if (confirm('Удалить?')) onDelete(item.id) }}
          className="text-[12px] cursor-pointer border-none bg-transparent px-1"
          style={{ color: 'var(--muted)' }}>
          🗑
        </button>
      </div>
    </div>
  )
}

export function ListScreen() {
  const { serverState, send } = useWsStore()
  const meId      = useSessionStore(s => s.me?.id)
  const showToast = useToastStore(s => s.show)

  const [openCats,    setOpenCats]    = useState<Record<string, boolean>>({ rent: true, meat: true })
  const [addModal,    setAddModal]    = useState<string | null>(null)
  const [catModal,    setCatModal]    = useState(false)
  const [buyerModal,  setBuyerModal]  = useState<string | null>(null)
  const [selectedEmoji, setEmoji]     = useState('📦')
  const [newItem,     setNewItem]     = useState({ name: '', qty: '1', unit: 'шт' })
  const [newCat,      setNewCat]      = useState({ title: '' })
  const [customBuyer, setCustomBuyer] = useState('')

  const { categories = [], items = [], members = [] } = serverState ?? {}

  function toggleCat(id: string) { setOpenCats(p => ({ ...p, [id]: !p[id] })) }

  function onUpdate(id: string, field: string, value: unknown) {
    send({ type: 'item:update', id, field, value })
  }
  function onDelete(id: string) { send({ type: 'item:delete', id }) }

  function saveItem() {
    if (!newItem.name.trim()) return
    send({ type: 'item:add', catId: addModal!, name: newItem.name.trim(),
           qty: parseFloat(newItem.qty) || 1, price: 0, unit: newItem.unit })
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
    <div className="px-[14px] pt-2 pb-8 relative z-10">
      {categories.map(cat => {
        const catItems = items.filter(i => i.cat_id === cat.id)
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
                onClick={e => { e.stopPropagation(); if (confirm(`Удалить категорию «${cat.title}»?`)) send({ type: 'cat:delete', id: cat.id }) }}
                className="text-[14px] cursor-pointer border-none bg-transparent px-1 rounded"
                style={{ color: 'var(--muted)' }}>
                🗑
              </button>
              <span style={{ color: 'var(--muted)', fontSize: 11, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .25s' }}>▶</span>
            </div>

            {isOpen && (
              <>
                {catItems.map(it => (
                  <div key={it.id}>
                    <Divider />
                    <ItemRow item={it} members={members}
                      onUpdate={onUpdate} onDelete={onDelete} onBuyerOpen={openBuyer} />
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

      <button onClick={() => { setEmoji('📦'); setCatModal(true) }}
        className="w-full py-[13px] rounded-[14px] border-none text-[13px] font-bold flex items-center justify-center gap-[6px] cursor-pointer mb-[10px]"
        style={{ background: 'var(--g)', border: '1px dashed var(--gb)', color: 'var(--muted)', fontFamily: 'inherit' }}>
        ＋ Добавить категорию
      </button>

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

      {/* Buyer modal */}
      <Modal open={!!buyerModal} onClose={() => setBuyerModal(null)} title="Кто купит?">
        <div className="grid gap-[7px] mb-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {members.map(m => {
            const item   = items.find(i => i.id === buyerModal)
            const active = item?.buyer_id === m.user_id
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
