import { useState } from 'react'

import { Modal, ModalButtons, GlassInput, GlassSelect } from '@shared/ui/Modal'
import { SegmentedControl } from '@shared/ui/SegmentedControl'
import { ITEM_UNITS } from '@entities/item/model'

import type { Category } from '@shared/types'

export interface AddItemPayload {
  catId: string
  name:  string
  qty:   number
  unit:  string
  kind:  'bring' | 'task'
}

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  /** Категория задана контекстом (ListScreen) — селект скрыт. */
  fixedCatId?: string | null
  /** Категории на выбор, когда fixedCatId не задан (SummaryScreen). */
  categories?: Category[]
  /** Предзаполненное название (напр. позиция из панели агента). */
  initialName?: string
  onSubmit: (payload: AddItemPayload) => void
}

/**
 * Модалка «Добавить пункт» — контролируемая снаружи (open/onClose/onSubmit).
 * Форма живёт во внутреннем AddItemForm, который монтируется только при open,
 * поэтому поля сбрасываются при каждом открытии.
 */
export function AddItemModal({ open, onClose, ...rest }: AddItemModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Добавить пункт">
      <AddItemForm onClose={onClose} {...rest} />
    </Modal>
  )
}

type AddItemFormProps = Omit<AddItemModalProps, 'open'>

function AddItemForm({ onClose, fixedCatId, categories = [], initialName = '', onSubmit }: AddItemFormProps) {
  const [name,  setName]  = useState(initialName)
  const [qty,   setQty]   = useState('1')
  const [unit,  setUnit]  = useState('шт')
  const [kind,  setKind]  = useState<'bring' | 'task'>('bring')
  const [catId, setCatId] = useState(fixedCatId ?? categories[0]?.id ?? '')

  function handleConfirm() {
    const trimmed = name.trim()
    if (!trimmed || !catId) return
    onSubmit({ catId, name: trimmed, qty: parseFloat(qty) || 1, unit, kind })
  }

  return (
    <>
      <div className="mb-3">
        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
          Тип пункта
        </div>
        <SegmentedControl
          value={kind}
          onChange={v => setKind(v as 'bring' | 'task')}
          label="Тип пункта"
          options={[
            { value: 'bring', label: 'Взять с собой' },
            { value: 'task', label: 'Сделать' },
          ]}
        />
      </div>

      <GlassInput label="Название" value={name}
        onChange={e => setName(e.target.value)}
        placeholder={kind === 'task' ? 'Подключить интернет' : 'Шашлык из курицы'} autoFocus />

      {!fixedCatId && (
        <GlassSelect label="Категория" value={catId} onChange={e => setCatId(e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
        </GlassSelect>
      )}

      {kind !== 'task' && (
        <div className="form-field-row">
          <GlassInput label="Кол-во" type="number" min="0" step="0.5"
            value={qty} onChange={e => setQty(e.target.value)} />
          <GlassSelect label="Единица" value={unit} onChange={e => setUnit(e.target.value)}>
            {ITEM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </GlassSelect>
        </div>
      )}

      <ModalButtons onCancel={onClose} onConfirm={handleConfirm} confirmText="Добавить" />
    </>
  )
}
