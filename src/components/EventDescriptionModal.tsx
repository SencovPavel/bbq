import { useEffect, useState, type CSSProperties } from 'react'

import { Modal, ModalButtons } from './Modal'

interface EventDescriptionModalProps {
  open: boolean
  initialDescription: string
  onClose: () => void
  onSave: (description: string | null) => void
}

export function EventDescriptionModal({
  open,
  initialDescription,
  onClose,
  onSave,
}: EventDescriptionModalProps) {
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    if (open) setDescription(initialDescription)
  }, [open, initialDescription])

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: 12,
    background: 'rgba(255,240,200,.06)',
    border: '1px solid rgba(255,220,150,0.15)',
    color: 'var(--text)',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
    minHeight: 120,
    lineHeight: 1.5,
  }

  return (
    <Modal open={open} onClose={onClose} title="Заметки к событию">
      <textarea
        style={inputStyle}
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Любые заметки про событие…"
        autoFocus
      />
      <ModalButtons
        onCancel={onClose}
        onConfirm={() => onSave(description.trim() || null)}
        cancelText="Отмена"
        confirmText="Сохранить"
        danger={false}
      />
    </Modal>
  )
}
