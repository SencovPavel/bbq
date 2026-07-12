import { Modal } from '@shared/ui/Modal'
import { IconPencil, IconShare, IconTrash, IconChevronRight } from '@shared/ui/Icon'

import type { Item } from '@shared/types'

interface ItemActionsSheetProps {
  item: Item | null
  hasBudget?: boolean
  onClose: () => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
  onShare: (item: Item) => void
  onSetPrice: (id: string) => void
  onMove: (id: string) => void
}

export function ItemActionsSheet({
  item,
  hasBudget = true,
  onClose,
  onRename,
  onDelete,
  onShare,
  onSetPrice,
  onMove,
}: ItemActionsSheetProps) {
  if (!item) return null

  const rowClass =
    'w-full flex items-center gap-3 py-2.5 px-1 bg-transparent border-none cursor-pointer text-md font-bold text-left'
  const rowStyle = { color: 'var(--text)', fontFamily: 'inherit' } as const

  return (
    <Modal open onClose={onClose} title={item.name}>
      {hasBudget && item.kind !== 'task' && (
        <button
          type="button"
          className={rowClass}
          style={rowStyle}
          onClick={() => { onSetPrice(item.id); onClose() }}
        >
          <span className="font-black" style={{ width: 16, textAlign: 'center', color: 'var(--accent)' }}>₽</span> Указать цену
        </button>
      )}
      <button
        type="button"
        className={rowClass}
        style={rowStyle}
        onClick={() => { onRename(item.id); onClose() }}
      >
        <IconPencil size={16} /> Переименовать
      </button>
      <button
        type="button"
        className={rowClass}
        style={rowStyle}
        onClick={() => { onMove(item.id); onClose() }}
      >
        <IconChevronRight size={16} /> В другую категорию
      </button>
      <button
        type="button"
        className={rowClass}
        style={rowStyle}
        onClick={() => { onShare(item); onClose() }}
      >
        <IconShare size={16} /> Поделиться позицией
      </button>
      <div className="h-px my-2" style={{ background: 'var(--gb)' }} />
      <button
        type="button"
        className={rowClass}
        style={{ ...rowStyle, color: 'var(--red)' }}
        onClick={() => { onDelete(item.id); onClose() }}
      >
        <IconTrash size={16} /> Удалить позицию
      </button>
    </Modal>
  )
}
