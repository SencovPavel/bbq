import { GlassCard, Divider } from '@shared/ui/GlassCard'
import { ItemRow } from '@widgets/ItemRow'
import { Modal, ModalButtons, GlassInput, GlassSelect } from '@shared/ui/Modal'
import { ConfirmModal } from '@shared/ui/ConfirmModal'
import { EmptyState } from '@shared/ui/EmptyState'
import { CompletedEventBanner } from '@entities/event/ui/CompletedEventBanner'
import { NoEventsPrompt } from '@widgets/NoEventsPrompt'
import { ItemActionsSheet } from '@widgets/ItemActionsSheet'
import { CatTile } from '@entities/category/ui/CatTile'
import { IconCart, IconTrash } from '@shared/ui/Icon'
import { useListScreenVM, UNITS, EMOJIS } from './useListScreenVM'

// ── ListScreen ────────────────────────────────────────────────────────────────

export function ListScreen() {
  const vm = useListScreenVM()
  const {
    events, categories, members, visibleItems, listTotal, actionItem, me,
    openCats, addModal, catModal, buyerModal, selectedEmoji,
    newItem, newCat, customBuyer, confirmCat, renamingId, renameTick,
    amIAdmin, listLocked,
    onUpdate, requestDeleteItem, saveItem, handleBuyerTap, assignBuyer, triggerRename,
    toggleCat, saveCat,
    setAddModal, setCatModal, setEmoji, setNewItem, setNewCat,
    setCustomBuyer, setConfirmCat, setActionItemId, setShowEventSheet,
    catItems, send, showLockedToast, fmt, stepForUnit, fmtQty,
  } = vm

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <div className="px-3.5 pt-2 pb-8 relative">
      {listLocked && <CompletedEventBanner />}

      {categories.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-0.5" aria-label="Сумма по списку">
          <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>По списку</span>
          <span className="text-sm font-black tabular-nums tracking-tight" style={{ color: listTotal > 0 ? 'var(--accent)' : 'var(--muted)' }}>
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
        const items = catItems(cat.id)
        const isOpen = openCats[cat.id] !== false
        return (
          <GlassCard key={cat.id}>
            <div
              className="flex items-center gap-[10px] px-[15px] py-[13px] cursor-pointer select-none"
              onClick={() => toggleCat(cat.id)}
            >
              <CatTile emoji={cat.icon} size={36} radius={10} />
              <div className="text-[14px] font-extrabold flex-1">{cat.title}</div>
              <button
                onClick={e => { e.stopPropagation(); if (!listLocked) setConfirmCat({ id: cat.id, title: cat.title }) }}
                className="cursor-pointer border-none bg-transparent px-1 rounded flex items-center"
                style={{ color: 'var(--muted)', visibility: listLocked ? 'hidden' : 'visible' }}
              >
                <IconTrash size={14} />
              </button>
              <span style={{ color: 'var(--muted)', fontSize: 11, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .25s' }}>▶</span>
            </div>

            {isOpen && (
              <>
                {items.length === 0 && (
                  <div className="py-5 text-center text-[12px]" style={{ color: 'var(--muted)' }}>
                    Пусто — добавь первую позицию ↓
                  </div>
                )}
                {items.map(it => (
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
                      stepForUnit={stepForUnit}
                      fmtQty={fmtQty}
                      fmt={fmt}
                    />
                  </div>
                ))}
                {!listLocked && (
                  <>
                    <Divider />
                    <button
                      onClick={() => setAddModal(cat.id)}
                      className="w-full py-[10px] border-none bg-transparent text-[12px] font-bold flex items-center justify-center gap-[5px] cursor-pointer"
                      style={{ borderTop: '1px dashed var(--surface-white-10)', color: 'var(--muted)', fontFamily: 'inherit' }}
                    >
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
        <button
          onClick={() => { setEmoji('📦'); setCatModal(true) }}
          className="w-full py-[13px] rounded-[14px] border-none text-[13px] font-bold flex items-center justify-center gap-[6px] cursor-pointer mb-[10px]"
          style={{ background: 'var(--g)', border: '1px dashed var(--gb)', color: 'var(--muted)', fontFamily: 'inherit' }}
        >
          ＋ Добавить категорию
        </button>
      )}

      {/* Add item modal */}
      <Modal open={!!addModal} onClose={() => setAddModal(null)} title="Добавить позицию">
        <GlassInput label="Название" value={newItem.name}
          onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
          placeholder="Шашлык из курицы" autoFocus />
        <div className="form-field-row">
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
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(7,1fr)' }}>
          {EMOJIS.map(em => (
            <button key={em} type="button" onClick={() => setEmoji(em)}
              className="p-1 rounded-[12px] cursor-pointer flex items-center justify-center border"
              style={{
                background: selectedEmoji === em ? 'var(--surface-fire-12)' : 'transparent',
                borderColor: selectedEmoji === em ? 'var(--accent)' : 'transparent',
                fontFamily: 'inherit',
              }}
            >
              <CatTile emoji={em} size={34} radius={9} />
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

      {/* Item actions sheet */}
      <ItemActionsSheet
        item={actionItem}
        onClose={() => setActionItemId(null)}
        onRename={() => { if (actionItem) triggerRename(actionItem.id) }}
        onDelete={requestDeleteItem}
        onShare={it => {
          const text = `${it.name} — ${it.qty} ${it.unit}`
          if (navigator.share) navigator.share({ text }).catch(() => {})
          else navigator.clipboard?.writeText(text).then(() => vm.showLockedToast())
        }}
      />

      {/* Buyer modal */}
      <Modal open={!!buyerModal} onClose={() => vm.setActionItemId(null)} title="Кто купит?">
        <div className="grid gap-[7px] mb-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {members.map(m => {
            const it     = visibleItems.find(i => i.id === buyerModal)
            const active = it?.buyer_id === m.user_id
            return (
              <button key={m.user_id} onClick={() => assignBuyer(m.user_id, m.name)}
                className="py-[9px] px-1 rounded-[10px] text-[12px] font-bold cursor-pointer border-none text-center"
                style={{
                  background: active ? 'var(--accent)' : 'var(--surface-white-8)',
                  border:     active ? '1px solid var(--accent)' : '1px solid var(--gb)',
                  color:      active ? 'var(--text-on-accent)' : 'var(--text)', fontFamily: 'inherit',
                }}
              >
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
