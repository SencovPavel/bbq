import { Modal } from '../Modal'
import { IconPencil, IconShare, IconTrash } from '../Icon'

import type { Item } from '../../types'

interface ItemActionsSheetProps {
  item: Item | null
  onClose: () => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
  onShare: (item: Item) => void
}

export function ItemActionsSheet({
  item,
  onClose,
  onRename,
  onDelete,
  onShare,
}: ItemActionsSheetProps) {
  if (!item) return null

  const rowClass =
    'w-full flex items-center gap-3 py-2.5 px-1 bg-transparent border-none cursor-pointer text-md font-bold text-left'
  const rowStyle = { color: 'var(--text)', fontFamily: 'inherit' } as const

  return (
    <Modal open onClose={onClose} title={item.name}>
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
